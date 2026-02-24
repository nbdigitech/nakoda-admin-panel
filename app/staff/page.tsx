"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StaffTable from "@/components/staff/staff";
import AddStaffModal from "@/components/staff/add-staff-modal";
import { Plus } from "lucide-react";

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState("Today");
  const [statusFilter, setStatusFilter] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("Today")}
              className="px-6 py-2 rounded-lg font-semibold whitespace-nowrap"
              style={
                activeTab === "Today"
                  ? { backgroundColor: "#F87B1B1A", color: "#F87B1B" }
                  : {
                      color: "#F87B1B",
                    }
              }
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab("All")}
              className="px-6 py-2 rounded-lg font-semibold whitespace-nowrap"
              style={
                activeTab === "All"
                  ? { backgroundColor: "#F87B1B1A", color: "#F87B1B" }
                  : {
                      color: "#F87B1B",
                    }
              }
            >
              All Staff
            </button>
          </div>

          <div className="flex items-center flex-1 justify-end w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search staff by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full lg:w-[300px] py-3 px-4 mr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F87B1B]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[180px] py-3 px-3 mr-4 border text-[#F87B1B] rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#F87B1B]"
              style={{ backgroundColor: "#F87B1B1A" }}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <AddStaffModal
              onSuccess={() => setRefreshKey((prev) => prev + 1)}
              trigger={
                <button className="bg-[#7FFF7C5C] text-sm text-[#009846] font-bold py-3 px-12 rounded-lg flex items-center  transition-colors ">
                  <Plus className="w-5 h-5 mr-1" />
                  Add New Staff
                </button>
              }
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow ">
          <StaffTable
            activeTab={activeTab}
            statusFilter={statusFilter}
            searchTerm={searchTerm}
            refreshTrigger={refreshKey}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
