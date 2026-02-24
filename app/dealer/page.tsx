"use client";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DealerTable from "@/components/dealer/dealer-table";
import Link from "next/link";
import { Plus } from "lucide-react";
import AddDealerModal from "@/components/dealer/add-dealer-modal";
import { useState } from "react";

export default function DealerPage() {
  const [activeTab, setActiveTab] = useState("Today");
  const [statusFilter, setStatusFilter] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 -mt-2 mb-6">
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
              All Dealer
            </button>
          </div>

          <div className="flex items-center flex-1 justify-end w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search dealer by name..."
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
            <AddDealerModal
              onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
              trigger={
                <button className="bg-[#7FFF7C5C] text-sm text-[#009846] font-bold py-3 px-12 rounded-lg flex items-center  transition-colors ">
                  <Plus className="w-5 h-5 mr-1" />
                  Add Dealer
                </button>
              }
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DealerTable
            activeTab={activeTab}
            statusFilter={statusFilter}
            searchTerm={searchTerm}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
