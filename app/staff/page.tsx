"use client"
import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import StaffTable from "@/components/staff/staff"
import AddStaffModal from "@/components/staff/add-staff-modal"
import { Plus } from "lucide-react"

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState("Staff")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
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
              All
            </button>
            <button
              onClick={() => setActiveTab("Sub Dealer")}
              className="px-6 py-2 rounded-lg font-semibold whitespace-nowrap"
              style={activeTab === "Sub Dealer"
                ?{ backgroundColor: "#F87B1B1A", color: "#F87B1B" }:{
                          color: "#F87B1B"
                      }
              }
            >
              ASM
            </button>
          </div>

          <div className="flex items-center">
            <select className="w-[180px] py-3 px-3 mr-4 border text-[#F87B1B] rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#F87B1B]" style={{ backgroundColor: "#F87B1B1A" }}>
              <option>All</option>
            </select>
              <AddStaffModal
                     
                                         trigger={
                                           <button
                                                     className="bg-[#7FFF7C5C] text-sm text-[#009846] font-bold py-3 px-12 rounded-lg flex items-center  transition-colors "
                                                   >
                                                         <Plus className="w-5 h-5 mr-1" />
                                       
                                                      Add New Staff 
                                                   </button>
                                                 }
                                       />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow ">
          <StaffTable />
        </div>
      </div>
    </DashboardLayout>
  )
}
