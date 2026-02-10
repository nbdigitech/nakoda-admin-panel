"use client"
import DashboardLayout from "@/components/layout/dashboard-layout"
import DealerTable from "@/components/dealer/dealer-table"
import Link from "next/link"
import { Plus } from "lucide-react"
import AddDealerModal from "@/components/dealer/add-dealer-modal"
import { useState } from "react"

export default function DealerPage() {
  const [activeTab, setActiveTab] = useState("Dealer")
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 -mt-2 mb-6">
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
                    Today
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
                    All Dealer
                  </button>
                </div>
        
                <div className="flex items-center ">
                  <select className="w-[180px] py-3 px-3 mr-4 border text-[#F87B1B] rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#F87B1B]" style={{ backgroundColor: "#F87B1B1A" }}>
                    <option>All</option>
                  </select>
                   <AddDealerModal

                    trigger={
                      <button
                                className="bg-[#7FFF7C5C] text-sm text-[#009846] font-bold py-3 px-12 rounded-lg flex items-center  transition-colors "
                              >
                                    <Plus className="w-5 h-5 mr-1" />
                  
                                 Add Dealer
                              </button>
                            }
                  />
                </div>
              </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DealerTable />
        </div>
      </div>
    </DashboardLayout>
  )
}
