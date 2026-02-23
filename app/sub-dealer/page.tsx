"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Plus } from "lucide-react";
import SubDealerTable from "@/components/sub-dealer/sub-dealer-table";

export default function DealerPage() {
  const [activeTab, setActiveTab] = useState("Sub Dealer");
  const [openModal, setOpenModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 -mt-2 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("Dealer")}
              className="px-6 py-2 rounded-lg font-semibold whitespace-nowrap"
              style={
                activeTab === "Dealer"
                  ? { backgroundColor: "#F87B1B1A", color: "#F87B1B" }
                  : {
                      color: "#F87B1B",
                    }
              }
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab("Sub Dealer")}
              className="px-6 py-2 rounded-lg font-semibold whitespace-nowrap"
              style={
                activeTab === "Sub Dealer"
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
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <SubDealerTable statusFilter={statusFilter} searchTerm={searchTerm} />
        </div>
      </div>
    </DashboardLayout>
  );
}
