"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { updateRewardRedemptionStatus } from "@/services/rewards";
import { useToast } from "@/hooks/use-toast";

interface RedeemData {
  id: string;
  influencerId: string;
  subDealerName?: string;
  redeemPoints: number;
  createdAt: any;
  rewardsId: string;
  status: string;
  productTitle?: string;
  category?: string;
}

interface UpdateRewardsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedData?: RedeemData | null;
  onSuccess?: () => void;
}

export default function UpdateRewardsDrawer({
  open,
  onOpenChange,
  selectedData,
  onSuccess,
}: UpdateRewardsDrawerProps) {
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedData) {
      setStatus(selectedData.status);
    }
  }, [selectedData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedData) return;

    try {
      setLoading(true);
      await updateRewardRedemptionStatus(selectedData.id, status);
      toast({ title: "Success", description: "Redemption status updated" });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Error Date";
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="right-0 left-auto h-full w-[400px] rounded-l-2xl border-l shadow-2xl">
        <div className="flex flex-col h-full bg-white">
          <div className="bg-[#F87B1B] text-white px-6 py-6 flex justify-between items-center">
            <div>
              <DrawerTitle className="text-xl font-bold uppercase tracking-tight text-white">
                Update Request
              </DrawerTitle>
              <DrawerDescription className="text-[10px] opacity-80 mt-1 font-medium text-white">
                Manage redemption fulfillment
              </DrawerDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="hover:rotate-90 transition-transform p-1 bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-8 space-y-8"
          >
            {/* Info Section */}
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Sub Dealer
                </label>
                <p className="text-lg font-bold text-gray-800">
                  {selectedData?.subDealerName || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Product Requested
                </label>
                <p className="text-sm font-semibold text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                  "{selectedData?.productTitle}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Redeemed Pts
                  </label>
                  <p className="text-xl font-black text-orange-600">
                    {selectedData?.redeemPoints} pts
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Request Date
                  </label>
                  <p className="text-[11px] font-bold text-gray-500">
                    {formatDate(selectedData?.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Status Select */}
            <div className="space-y-4">
              <label className="text-xs font-black text-[#F87B1B] uppercase tracking-widest flex justify-between items-center">
                Action Status
                <span className="text-[10px] bg-orange-50 px-2 py-0.5 rounded text-[#F87B1B]">
                  Active Selection
                </span>
              </label>
              <div className="relative group">
                <select
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 bg-white focus:outline-none focus:border-[#F87B1B] appearance-none cursor-pointer transition-all shadow-sm hover:border-gray-300"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#F87B1B] transition-colors">
                  ▼
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic px-2">
                Changing status will affect the user's dashboard view
                immediately.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-10">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F87B1B] hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:active:scale-100"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>UPDATE STATUS</span>
                    <span className="text-xs opacity-50 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
              >
                Cancel Changes
              </button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
