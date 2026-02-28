"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Plus } from "lucide-react";
import SubDealerTable from "@/components/sub-dealer/sub-dealer-table";

export default function DealerPage() {
  const [activeTab, setActiveTab] = useState("Today");
  const [openModal, setOpenModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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
              All Sub Dealer
            </button>
          </div>

          <div className="flex items-center flex-1 justify-end w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search sub dealer by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full lg:w-[300px] py-3 px-4 mr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F87B1B]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-8 py-2.5 rounded-full font-bold transition-all duration-200 border-2 ${
              statusFilter === "all"
                ? "bg-[#F87B1B] text-white border-[#F87B1B] shadow-md transform scale-105"
                : "bg-white text-gray-500 border-gray-200 hover:border-[#F87B1B] hover:text-[#F87B1B]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-8 py-2.5 rounded-full font-bold transition-all duration-200 border-2 ${
              statusFilter === "active"
                ? "bg-[#F87B1B] text-white border-[#F87B1B] shadow-md transform scale-105"
                : "bg-white text-gray-500 border-gray-200 hover:border-[#F87B1B] hover:text-[#F87B1B]"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-8 py-2.5 rounded-full font-bold transition-all duration-200 border-2 ${
              statusFilter === "inactive"
                ? "bg-[#F87B1B] text-white border-[#F87B1B] shadow-md transform scale-105"
                : "bg-white text-gray-500 border-gray-200 hover:border-[#F87B1B] hover:text-[#F87B1B]"
            }`}
          >
            Inactive
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <SubDealerTable
            activeTab={activeTab}
            statusFilter={statusFilter}
            searchTerm={searchTerm}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
