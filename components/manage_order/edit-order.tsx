import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  getInfluencerOrderFulfillments,
  getDistributorOrderFulfillments,
  updateOrder,
  createFulfillment,
} from "@/services/orders";
import { Loader2, PackageCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getFirestoreDB } from "@/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

interface Fulfillment {
  id: string;
  acceptedQtyTons: number;
  createdAt: any;
  date: any;
  distributorId: string;
  influencerOrderId: string;
  status: string;
  rate?: number;
}

interface EditOrderDrawerProps {
  order: any;
  orderSource: "dealer" | "sub-dealer";
  trigger?: React.ReactNode;
  onUpdate?: () => void;
}

export default function EditOrders({
  order,
  orderSource,
  trigger = (
    <button className="text-[#F87B1B] hover:text-[#F87B1B] font-bold">
      Edit
    </button>
  ),
  onUpdate,
}: EditOrderDrawerProps) {
  const [open, setOpen] = useState(false);
  const [fulfillments, setFulfillments] = useState<Fulfillment[]>([]);
  const [loadingFulfillments, setLoadingFulfillments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [formState, setFormState] = useState({
    distributorId: order.distributorId,
    mobileNumber: order.mobileNumber,
    newFulfilledQtyTons: "",
    status: order.status,
    rate: order.rate,
  });

  // Sync with prop changes and reset when opened
  useEffect(() => {
    if (open) {
      setFormState((prev) => ({
        ...prev,
        distributorId: order.distributorId,
        mobileNumber: order.mobileNumber,
        newFulfilledQtyTons: "",
        status: order.status,
        rate: order.rate,
      }));
      fetchLatestRate();
      if (order.id) {
        loadFulfillments();
      }
    }
  }, [open, order]);

  const fetchLatestRate = async () => {
    try {
      const db = getFirestoreDB();
      if (!db) return;

      const q = query(
        collection(db, "daily_price"),
        orderBy("createdAt", "desc"),
        limit(1),
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const latestRate = querySnapshot.docs[0].data().newPrice;
        setFormState((prev) => ({
          ...prev,
          rate: latestRate.toString(),
        }));
      }
    } catch (error) {
      console.error("Error fetching latest rate:", error);
    }
  };

  const loadFulfillments = async () => {
    try {
      setLoadingFulfillments(true);
      const data: any =
        orderSource === "sub-dealer"
          ? await getInfluencerOrderFulfillments()
          : await getDistributorOrderFulfillments();
      setFulfillments(data);
    } catch (error) {
      console.error("Error loading fulfillments:", error);
    } finally {
      setLoadingFulfillments(false);
    }
  };

  const handleFulfilledChange = (val: string) => {
    let numVal = parseFloat(val) || 0;
    const initialFilled = parseFloat(order.fulfilledQtyTons) || 0;
    const totalQty = parseFloat(order.totalQtyTons) || 0;
    const currentPending = Math.max(0, totalQty - initialFilled);

    // validation and capping
    if (numVal > currentPending) {
      numVal = currentPending;
      val = currentPending.toString();
    }

    const totalFulfilledNow = initialFilled + numVal;

    let newStatus = formState.status;

    if (totalFulfilledNow === 0) {
      newStatus = "pending";
    } else if (Math.abs(totalFulfilledNow - totalQty) < 0.01) {
      newStatus = "processing";
    } else {
      newStatus = "inprogress";
    }

    setFormState({
      ...formState,
      newFulfilledQtyTons: val,
      status: newStatus,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const collectionName =
        orderSource === "dealer" ? "distributor_orders" : "influencer_orders";

      const newFulfillment = parseFloat(formState.newFulfilledQtyTons) || 0;
      const initialFulfilled = parseFloat(order.fulfilledQtyTons) || 0;
      const totalQty = parseFloat(order.totalQtyTons) || 0;
      const finalFulfilled = initialFulfilled + newFulfillment;

      const payload: any = {
        fulfilledQtyTons: finalFulfilled,
        pendingQtyTons: Math.max(0, totalQty - finalFulfilled),
        status: formState.status,
        rate: formState.rate,
        updatedAt: serverTimestamp(),
      };

      // Calculate weighted average rate
      const currentFulfillmentsCost = fulfillments.reduce(
        (acc, f) => acc + (f.acceptedQtyTons || 0) * (f.rate || 0),
        0,
      );
      const newFulfillmentCost =
        newFulfillment * (parseFloat(formState.rate) || 0);
      const totalCost = currentFulfillmentsCost + newFulfillmentCost;
      const averageRate = finalFulfilled > 0 ? totalCost / finalFulfilled : 0;

      if (averageRate > 0) {
        payload.averageRate = averageRate;
        // Also save as main rate if completing
        if (
          ["approved", "completed"].includes(
            (formState.status || "").toLowerCase(),
          )
        ) {
          payload.rate = averageRate.toFixed(2);
        }
      }

      await updateOrder(collectionName, order.id, payload);

      // Create fulfillment record if new quantity added
      if (newFulfillment > 0) {
        const fulfillmentCollection =
          orderSource === "dealer"
            ? "distributor_orders_fulfillments"
            : "influencer_orders_fulfillments";

        const orderIdKey =
          orderSource === "dealer" ? "distributorOrderId" : "influencerOrderId";

        const fulfillmentData = {
          acceptedQtyTons: newFulfillment,
          createdAt: serverTimestamp(),
          [orderIdKey]: order.id,
          rate: parseFloat(formState.rate) || 0,
          status: "accepted",
        };

        await createFulfillment(fulfillmentCollection, fulfillmentData);
      }

      toast({
        title: "Order Updated",
        description:
          "The order and fulfillment records have been successfully updated.",
      });
      setOpen(false);

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the order.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const remainingQty =
    (parseFloat(order.totalQtyTons) || 0) -
    (parseFloat(order.fulfilledQtyTons) || 0) -
    (parseFloat(formState.newFulfilledQtyTons) || 0);

  const isFulfillmentEntered =
    (parseFloat(formState.newFulfilledQtyTons) || 0) > 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-[450px] p-0 flex flex-col [&>button]:hidden">
        {/* Orange Header */}
        <div className="flex justify-between bg-[#F87B1B] text-white px-6 py-6 items-center">
          <div>
            <h2 className="text-xl font-bold">Manage Order</h2>
            <p className="text-xs opacity-90 mt-1">
              Update details & fulfillments
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase opacity-80">
              Order ID
            </p>
            <p className="text-sm font-bold">#{order.orderId}</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 px-6 py-6 flex-1 overflow-y-auto"
        >
          {/* Main Info Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Distributor ID
              </label>
              <input
                type="text"
                value={formState.distributorId || "N/A"}
                disabled
                className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-lg bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={formState.mobileNumber || "N/A"}
                disabled
                className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-lg bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                  Total Quantity
                </label>
                <input
                  type="text"
                  value={parseFloat(order.totalQtyTons || 0).toFixed(2)}
                  disabled
                  className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-lg bg-gray-50 text-gray-700 font-bold cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#F87B1B] uppercase mb-1.5">
                  Fulfillment Qty
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formState.newFulfilledQtyTons ?? ""}
                  onChange={(e) => handleFulfilledChange(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-[#F87B1B4D] rounded-lg focus:outline-none focus:border-[#F87B1B] bg-white text-gray-800 font-bold"
                  placeholder="Enter fulfillment qty"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Remaining Quantity
              </label>
              <input
                type="text"
                value={remainingQty.toFixed(2)}
                disabled
                className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-lg bg-gray-50 text-gray-700 font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Current Status
              </label>
              <select
                value={formState.status}
                disabled={formState.status !== "pending"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "rejected" || val === "pending") {
                    setFormState({
                      ...formState,
                      status: val,
                      newFulfilledQtyTons: "",
                    });
                  } else {
                    setFormState({ ...formState, status: val });
                  }
                }}
                className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#F87B1B] bg-white text-[#F87B1B] font-bold transition-colors ${formState.status !== "pending" ? "cursor-not-allowed bg-gray-50 opacity-70" : "cursor-pointer"}`}
              >
                <option value="pending">PENDING</option>
                <option value="inprogress">IN PROGRESS</option>
                <option value="processing">PROCESSING</option>
                <option value="approved">COMPLETED</option>
                <option value="rejected">REJECTED</option>
              </select>
            </div>
          </div>

          {/* Fulfillment History (If any)
          {fulfillments.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                <PackageCheck className="w-4 h-4 text-[#F87B1B]" />
                Fulfillment History
              </h3>
              <div className="space-y-3">
                {fulfillments.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white border rounded-lg p-3 shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {f.acceptedQtyTons} Tons Accepted
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {formatDate(f.date)}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase bg-green-100 text-green-700`}
                    >
                      {f.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* Summary Section */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-gray-500 uppercase">
                New Rate
              </p>
              <p className="text-lg font-black text-[#009846]">
                ₹ {formState.rate}
              </p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <p className="text-xs font-bold text-gray-500 uppercase">
                Remaining Qty
              </p>
              <p className="text-lg font-black text-orange-600">
                {remainingQty.toFixed(2)} Tons
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#F87B1B] hover:bg-[#e86a0a] text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Update Order Details"
            )}
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
