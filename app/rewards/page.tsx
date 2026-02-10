"use client"

import { useState } from "react"
import Image from "next/image"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import AddRewardModal from "@/components/reward/add-reward-modal"
import RedeemHistoryTable from "@/components/reward/redeem-history-table"
import UpdateRewardsDrawer from "@/components/reward/update-rewards-drawer"

interface RewardProduct {
  id: number
  title: string
  points: number
  image: string
  validFrom: string
  validTill: string
}

interface RedeemData {
  id: number
  subDealerName: string
  redeemPts: number
  redeemDate: string
  productClaim: string
  category: string
  status: "Completed" | "Rejected" | "Approved"
}

const rewardProducts: RewardProduct[] = [
  {
    id: 1,
    title: "Sony Headphones",
    points: 2000,
    image: "/hphone.png",
    validFrom: "30 Mar 25",
    validTill: "Valid till",
  },
  {
    id: 2,
    title: "Xiaomi A Series 43",
    points: 4000,
    image: "/led.png",
    validFrom: "30 Dec 25",
    validTill: "Valid till",
  },
]

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState("Rewards")
  const [filterType, setFilterType] = useState("Gift")
  const [isAddRewardModalOpen, setIsAddRewardModalOpen] = useState(false)
  const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = useState(false)
  const [selectedRedeemData, setSelectedRedeemData] = useState<RedeemData | null>(null)

  const handleEditClick = (data: RedeemData) => {
    setSelectedRedeemData(data)
    setIsUpdateDrawerOpen(true)
  }

  const tabs = ["Rewards", "Redeem", "History"]

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
            onClick={() => setIsAddRewardModalOpen(true)}
          >
            <Plus className="w-5 h-5 mr-1" />
            Add Reward
          </button>
          </div>
        </div>
      </div>

      {/* ================= REWARDS CARDS ================= */}
      {activeTab === "Rewards" && (
      <div className="flex gap-8">

        {rewardProducts.map((item) => (
          <div
            key={item.id}
            className="w-48 bg-white rounded-2xl p-4 text-center border border-orange-200 hover:shadow-lg transition"
          >
            <div className="flex justify-center mb-4 h-32 items-center">
              <Image
                src={item.image}
                alt={item.title}
                width={120}
                height={120}
                className="object-contain max-h-full"
              />
            </div>

            <h3 className="text-base font-semibold text-[#929292] mb-3 line-clamp-2">
              {item.title}
            </h3>

            <p className="text-2xl font-bold text-gray-900 mb-1">
              {item.points} <span className="text-sm font-medium text-[#929292">pts</span>
            </p>

            <div className="space-y-0.5 mt-3 font-medium">
              <p className="text-xs  text-[#F87B1B]">{item.validFrom}</p>
              <p className="text-xs text-[#929292]">Valid Till</p>
            </div>
          </div>
        ))}

      </div>
      )}

      {/* ================= REDEEM & HISTORY TABLE ================= */}
      {(activeTab === "Redeem" || activeTab === "History") && (
        <RedeemHistoryTable 
          onEditClick={handleEditClick}
          showEditButton={activeTab === "Redeem"}
        />
      )}

      {/* Add Reward Modal */}
      <AddRewardModal 
        open={isAddRewardModalOpen} 
        onOpenChange={setIsAddRewardModalOpen}
      />

      {/* Update Rewards Drawer */}
      <UpdateRewardsDrawer
        open={isUpdateDrawerOpen}
        onOpenChange={setIsUpdateDrawerOpen}
        selectedData={selectedRedeemData}
      />
    </DashboardLayout>
  )
}
