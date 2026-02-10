"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import DashboardCards from "@/components/dashboard/dashboard-cards"
import OrderChart from "@/components/dashboard/order-chart"
import { Button } from "@/components/ui/button"
import OrdersTable, { Order } from "@/components/dashboard/orders-table"
import TodayRateCard from "@/components/dashboard/TodayRateCard"
import { Plus } from "lucide-react"

/* ================= ORDER DATA ================= */
const orders: Order[] = [
  {
    id: 1,
    orderId: "#151056",
    orderDate: "5/12/2025",
    dealerName: "Kabir Nag",
    qty: "550t",
    rate: "45,000",
    status: "Completed",
  },
  {
    id: 2,
    orderId: "#151057",
    orderDate: "5/12/2025",
    dealerName: "Bharat Sahu",
    qty: "550t",
    rate: "45,000",
    status: "Pending",
  },
  {
    id: 3,
    orderId: "#151058",
    orderDate: "5/12/2025",
    dealerName: "Bhuvan Raj",
    qty: "550t",
    rate: "45,000",
    status: "In Progress",
  },
]

const tabs = ["Today", "Pending", "Dispatch", "Cancelled", "Completed"]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Dealer")

  return (
    <DashboardLayout>
       <div className="mb-5">
      <TodayRateCard />
    </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-[0.7]">
          <DashboardCards />
        </div>
        
        {/* Chart Section - 30% */}
        <div className="flex-[0.3]">
          <OrderChart />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mt-10">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("Dealer")}
            className="px-6 py-2 rounded-lg font-semibold whitespace-nowrap"
            style={activeTab === "Dealer" 
              ? { backgroundColor: "#F87B1B1A", color: "#F87B1B" }:{
                 color: "#F87B1B"
              }
            }
          >
            Dealer
          </button>
          <button
            onClick={() => setActiveTab("Sub Dealer")}
            className="px-6 py-2 rounded-lg font-semibold whitespace-nowrap"
            style={activeTab === "Sub Dealer"
                ? { backgroundColor: "#F87B1B1A", color: "#F87B1B" }:{
                 color: "#F87B1B"
              }
            }
          >
            Sub Dealer
          </button>
        </div>

        <div className="flex items-center ">
          <select className="w-[180px] py-3 px-4 mr-4 border text-[#F87B1B] rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#F87B1B]" style={{ backgroundColor: "#F87B1B1A" }}>
            <option>All</option>
          </select>
          <button
            className="bg-[#c8efd9] text-sm text-[#009846] font-bold py-3 px-12 rounded-lg flex items-center transition-colors hover:bg-[#6FEF6C4C]"
          >
            <Plus className="w-5 h-5 mr-1" />
            Add Order
          </button>
        </div>
      </div>

      {/* ================= ORDER TABLE ================= */}
      <div className="mt-6">
        <OrdersTable orders={orders} />
      </div>
    </DashboardLayout>
  )
}
