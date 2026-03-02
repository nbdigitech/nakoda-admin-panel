"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit3, Trash2 } from "lucide-react";
import AddRewardModal from "@/components/reward/add-reward-modal";
import RedeemHistoryTable from "@/components/reward/redeem-history-table";
import UpdateRewardsDrawer from "@/components/reward/update-rewards-drawer";
import {
  getRewards,
  getRewardsHistory,
  deleteReward,
} from "@/services/rewards";
import { fetchUsers } from "@/services/orders";
import { useToast } from "@/hooks/use-toast";

interface RewardProduct {
  id: string;
  title: string;
  requiredPoints: number;
  imagePath: string;
  expiryDate: string;
  status: string;
  category: string;
  description: string;
}

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

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState("Rewards");
  const [filterType, setFilterType] = useState("Gift");
  const [isAddRewardModalOpen, setIsAddRewardModalOpen] = useState(false);
  const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = useState(false);
  const [selectedRedeemData, setSelectedRedeemData] =
    useState<RedeemData | null>(null);

  const [rewards, setRewards] = useState<RewardProduct[]>([]);
  const [history, setHistory] = useState<RedeemData[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [editingReward, setEditingReward] = useState<RewardProduct | null>(
    null,
  );

  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [rewardsData, historyData, users] = await Promise.all([
        getRewards(),
        getRewardsHistory(),
        fetchUsers(),
      ]);

      setRewards(rewardsData as any);
      setUsersMap(users);

      // Enrich history with user names and product details
      const enrichedHistory = historyData.map((item: any) => {
        const reward = (rewardsData as any).find(
          (r: any) => r.id === item.rewardsId,
        );
        return {
          ...item,
          subDealerName: (users as any)[item.influencerId]?.name || "Unknown",
          productTitle: reward?.title || "Unknown Product",
          category: reward?.category || "N/A",
        };
      });

      setHistory(enrichedHistory);
    } catch (error) {
      console.error("Error loading rewards data:", error);
      toast({
        title: "Error",
        description: "Failed to load rewards data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditRedeem = (data: RedeemData) => {
    setSelectedRedeemData(data);
    setIsUpdateDrawerOpen(true);
  };

  const handleEditReward = (reward: RewardProduct) => {
    setEditingReward(reward);
    setIsAddRewardModalOpen(true);
  };

  const handleDeleteReward = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this reward?")) return;
    try {
      await deleteReward(id);
      toast({ title: "Deleted", description: "Reward deleted successfully" });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete reward",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "No Expiry";
    try {
      if (typeof date === "string") return date;
      const d = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return "Invalid Date";
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      console.error("formatDate error:", e);
      return "Error Date";
    }
  };

  const tabs = ["Rewards", "Redeem", "History"];

  const filteredRewards = rewards.filter((r) => r.category === filterType);

  // Redeem tab shows pending, History shows everything else
  const filteredHistory = history.filter((h) => {
    if (activeTab === "Redeem") return h.status === "pending";
    if (activeTab === "History") return h.status !== "pending";
    return true;
  });

  return (
    <DashboardLayout>
      {/* ================= TAB SECTION ================= */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-8 border-b pb-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-2 font-medium text-sm transition border-b-2 ${
                  activeTab === tab
                    ? "text-[#F87B1B] border-[#F87B1B]"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filter & Add Button */}
          <div className="flex gap-3 items-center">
            {activeTab === "Rewards" && (
              <>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32 border-0 bg-orange-50 text-[#F87B1B] font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gift">Gift</SelectItem>
                    <SelectItem value="Voucher">Voucher</SelectItem>
                    <SelectItem value="Cashback">Cashback</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  className="bg-[#7FFF7C5C] text-sm text-[#009846] font-bold py-3 px-12 rounded-lg flex items-center transition-colors hover:bg-[#6FEF6C4C]"
                  onClick={() => {
                    setEditingReward(null);
                    setIsAddRewardModalOpen(true);
                  }}
                >
                  <Plus className="w-5 h-5 mr-1" />
                  Add Reward
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= REWARDS CARDS ================= */}
      {activeTab === "Rewards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredRewards.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-2xl p-4 text-center border border-orange-200 hover:shadow-lg transition flex flex-col items-center"
            >
              <div className="flex justify-center mb-4 h-32 w-full items-center relative overflow-hidden rounded-xl bg-gray-50 group-hover:bg-white transition-colors">
                <Image
                  src={item.imagePath || "/placeholder.png"}
                  alt={item.title}
                  fill
                  className="object-contain p-2"
                />
              </div>

              <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-1 w-full">
                {item.title}
              </h3>

              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-xl font-black text-gray-900">
                  {item.requiredPoints}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                  pts
                </span>
              </div>

              <div className="w-full pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col items-start">
                  <p className="text-[9px] font-black uppercase tracking-tight text-gray-400">
                    Expires
                  </p>
                  <p className="text-[10px] font-bold text-orange-600">
                    {formatDate(item.expiryDate)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditReward(item)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    title="Edit Reward"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteReward(item.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    title="Delete Reward"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredRewards.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center text-gray-400">
              No rewards found for this category.
            </div>
          )}
        </div>
      )}

      {/* ================= REDEEM & HISTORY TABLE ================= */}
      {(activeTab === "Redeem" || activeTab === "History") && (
        <RedeemHistoryTable
          data={filteredHistory}
          loading={loading}
          onEditClick={handleEditRedeem}
          showEditButton={activeTab === "Redeem"}
        />
      )}

      {/* Add/Edit Reward Modal */}
      <AddRewardModal
        open={isAddRewardModalOpen}
        onOpenChange={setIsAddRewardModalOpen}
        initialData={editingReward}
        onSuccess={loadData}
      />

      {/* Update Redemption Status Drawer */}
      <UpdateRewardsDrawer
        open={isUpdateDrawerOpen}
        onOpenChange={setIsUpdateDrawerOpen}
        selectedData={selectedRedeemData}
        onSuccess={loadData}
      />
    </DashboardLayout>
  );
}
