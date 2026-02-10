"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import AddDealerModal from "@/components/dealer/add-dealer-modal"
import OrdersTable, { Order } from "@/components/manage_order/orders_table"
import { Plus } from "lucide-react"

const orders: Order[] = [
  {
    id: 1,
    orderId: "#151056",
    orderDate: "5/12/2025",
    dealerName: "Ayaan Sahu",
    qty: "550t",
    shipTo: "Sankar Nagar Raipur",
    status: "Completed",
  },
  {
    id: 2,
    orderId: "#151057",
    orderDate: "5/12/2025",
    dealerName: "Arjun Kumar",
    qty: "550t",
    shipTo: "Ram Nagar Raipur",
    status: "Pending",
  },
  {
    id: 3,
    orderId: "#151058",
    orderDate: "5/12/2025",
    dealerName: "Jayant Singh",
    qty: "550t",
    shipTo: "Purani Basti Raipur",
    status: "In Progress",
  },
]

export default function ManageOrder() {
  const [activeTab, setActiveTab] = useState("Today")

  return (
    <DashboardLayout>
      {/* ================= TOP SECTION ================= */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-4">
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
          <select className="w-[180px] py-3 px-3 mr-4 border text-[#F87B1B] rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#F87B1B]" style={{ backgroundColor: "#F87B1B1A" }}>
            <option>All</option>
          </select>
           <AddDealerModal
            trigger={
              <button
                        className="bg-[#c8efd9] text-sm text-[#009846] font-bold py-3 px-12 rounded-lg flex items-center  transition-colors "
                      >
                            <Plus className="w-5 h-5 mr-1" />
          
                         Add Dealer
                      </button>
                    }
          />
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <OrdersTable orders={orders} />
    </DashboardLayout>
  )
}
