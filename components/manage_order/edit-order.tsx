import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getInfluencerOrderFulfillments } from "@/services/orders";
import { Loader2, PackageCheck } from "lucide-react";

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
  trigger?: React.ReactNode;
}

export default function EditOrders({
  order,
  trigger = (
    <button className="text-[#F87B1B] hover:text-[#F87B1B] font-bold">
      Edit
    </button>
  ),
}: EditOrderDrawerProps) {
  const [open, setOpen] = useState(false);
  const [fulfillments, setFulfillments] = useState<Fulfillment[]>([]);
  const [loadingFulfillments, setLoadingFulfillments] = useState(false);

  const [formState, setFormState] = useState({
    distributorName: order.distributorName,
    mobileNumber: order.mobileNumber,
    totalQtyTons: order.totalQtyTons,
    fulfilledQtyTons: order.fulfilledQtyTons,
    pendingQtyTons: order.pendingQtyTons,
    status: order.status,
    rate: order.rate,
  });

  useEffect(() => {
    if (open && order.id) {
      loadFulfillments();
    }
  }, [open, order.id]);

  const loadFulfillments = async () => {
    try {
      setLoadingFulfillments(true);
      const data: any = await getInfluencerOrderFulfillments(order.id);
      setFulfillments(data);
    } catch (error) {
      console.error("Error loading fulfillments:", error);
    } finally {
      setLoadingFulfillments(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (API not provided yet)
    setOpen(false);
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
          {/* Order Info Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Distributor
              </label>
              <input
                type="text"
                value={formState.distributorName}
                disabled
                className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-lg bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Mobile
              </label>
              <input
                type="text"
                value={formState.mobileNumber}
                disabled
                className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-lg bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Total Qty
              </label>
              <div className="flex items-center px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-white font-bold text-gray-800">
                {formState.totalQtyTons}t
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Fulfilled
              </label>
              <div className="flex items-center px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-green-50 text-green-700 font-bold">
                {formState.fulfilledQtyTons}t
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Pending
              </label>
              <div className="flex items-center px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-orange-50 text-orange-700 font-bold">
                {formState.pendingQtyTons}t
              </div>
            </div>
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              Current Status
            </label>
            <select
              value={formState.status}
              onChange={(e) =>
                setFormState({ ...formState, status: e.target.value })
              }
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#F87B1B] cursor-pointer bg-white text-[#F87B1B] font-bold transition-colors"
            >
              <option value="pending">PENDING</option>
              <option value="accepted">ACCEPTED</option>
              <option value="rejected">REJECTED</option>
              <option value="completed">COMPLETED</option>
            </select>
          </div>

          {/* Fulfillments History Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-[#F87B1B]" />
                Fulfillment History
              </h3>
            </div>

            {loadingFulfillments ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#F87B1B]" />
              </div>
            ) : fulfillments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-xs text-gray-500 italic">
                  No fulfillments recorded yet.
                </p>
              </div>
            ) : (
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
                      className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase ${
                        f.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {f.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rate Display */}
          <div className="bg-[#0098460D] border border-green-100 rounded-lg p-4 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">
              Total Rate
            </p>
            <p className="text-2xl font-black text-[#009846]">
              ₹ {formState.rate}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#F87B1B] hover:bg-[#e86a0a] text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
          >
            Update Order Status
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
