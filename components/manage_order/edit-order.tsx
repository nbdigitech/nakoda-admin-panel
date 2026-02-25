import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getInfluencerOrderFulfillments, updateOrder } from "@/services/orders";
import { Loader2, PackageCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Fulfillment {
  id: string;
  acceptedQtyTons: number;
  createdAt: any;
  date: any;
  distributorId: string;
  influencerOrderId: string;
  status: string;
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
      setFormState({
        distributorId: order.distributorId,
        mobileNumber: order.mobileNumber,
        newFulfilledQtyTons: "",
        status: order.status,
        rate: order.rate,
      });
      if (order.id) {
        loadFulfillments();
      }
    }
  }, [open, order]);

  const loadFulfillments = async () => {
    try {
      setLoadingFulfillments(true);
      // Only applicable for sub-dealers currently? Or is it generic?
      // For now keeping it for sub-dealers if that's where fulfillments are tracked.
      if (orderSource === "sub-dealer") {
        const data: any = await getInfluencerOrderFulfillments(order.id);
        setFulfillments(data);
      }
    } catch (error) {
      console.error("Error loading fulfillments:", error);
    } finally {
      setLoadingFulfillments(false);
    }
  };

  const handleFulfilledChange = (val: string) => {
    let numVal = parseFloat(val) || 0;
    const initialPending =
      (parseFloat(order.totalQtyTons) || 0) -
      (parseFloat(order.fulfilledQtyTons) || 0);

    if (numVal > initialPending) {
      numVal = initialPending;
      val = initialPending.toString();
    }

    const totalFulfilledNow =
      (parseFloat(order.fulfilledQtyTons) || 0) + numVal;
    const totalQty = parseFloat(order.totalQtyTons) || 0;

    let newStatus = formState.status;
    if (totalFulfilledNow > 0 && totalFulfilledNow < totalQty) {
      newStatus = "inprogress";
    } else if (totalFulfilledNow > 0 && totalFulfilledNow >= totalQty) {
      newStatus = "approved";
    } else if (totalFulfilledNow === 0) {
      newStatus = order.status === "rejected" ? "rejected" : "pending";
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

      const payload = {
        fulfilledQtyTons: finalFulfilled,
        pendingQtyTons: Math.max(0, totalQty - finalFulfilled),
        status: formState.status,
      };

      await updateOrder(collectionName, order.id, payload);

      toast({
        title: "Order Updated",
        description: "The order has been successfully updated.",
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
                  Pending Quantity
                </label>
                <input
                  type="text"
                  value={(
                    (parseFloat(order.totalQtyTons) || 0) -
                    (parseFloat(order.fulfilledQtyTons) || 0)
                  ).toFixed(2)}
                  disabled
                  className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-lg bg-gray-50 text-gray-700 font-bold cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#F87B1B] uppercase mb-1.5">
                  Add Fulfill Qty
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formState.newFulfilledQtyTons ?? ""}
                  onChange={(e) => handleFulfilledChange(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-[#F87B1B4D] rounded-lg focus:outline-none focus:border-[#F87B1B] bg-white text-gray-800 font-bold"
                  placeholder="Enter qty"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Current Status
              </label>
              <select
                value={formState.status}
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
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#F87B1B] cursor-pointer bg-white text-[#F87B1B] font-bold transition-colors"
              >
                <option value="pending">PENDING</option>
                <option value="inprogress">IN PROGRESS</option>
                {formState.status === "approved" && (
                  <option value="approved" disabled>
                    APPROVED
                  </option>
                )}
                <option value="rejected">REJECTED</option>
              </select>
            </div>
          </div>

          {/* Fulfillment History (If any) */}
          {orderSource === "sub-dealer" && fulfillments.length > 0 && (
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
          )}

          {/* Summary Section */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-gray-500 uppercase">Rate</p>
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
