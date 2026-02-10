"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import OrderHistoryTable from "@/components/orders/order-history-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function OrderHistoryPage() {
  const [activeTab, setActiveTab] = useState("Dealer")
  const [statusFilter, setStatusFilter] = useState("Completed")

  const tabs = ["Dealer", "Sub Dealer",]

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Tabs and Filter */}
        <div className="flex items-center justify-between bg-white rounded-lg p-4">
          <div className="flex gap-6 border-b">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-2 font-medium text-sm transition ${
                  activeTab === tab
                    ? "text-[#F87B1B] border-b-2 border-[#F87B1B]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 border-0 bg-orange-50 text-[#F87B1B]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow">
          <OrderHistoryTable />
        </div>
      </div>
    </DashboardLayout>
  )
}
