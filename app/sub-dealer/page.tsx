"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Plus } from "lucide-react";
import SubDealerTable from "@/components/sub-dealer/sub-dealer-table";
import AddSubDealerModal from "@/components/sub-dealer/add-sub-dealer-modal";

export default function DealerPage() {
  const [activeTab, setActiveTab] = useState("Sub Dealer");
  const [openModal, setOpenModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("active");

  return (
    <DashboardLayout>
      <AddSubDealerModal
        trigger={null}
        open={openModal}
        onOpenChange={setOpenModal}
      />
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

          <div className="flex items-center">
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
            <AddSubDealerModal
              trigger={
                <button className="bg-[#7FFF7C5C] text-sm text-[#009846] font-bold py-3 px-12 rounded-lg flex items-center  transition-colors ">
                  <Plus className="w-5 h-5 mr-1" />
                  Add Sub Dealer
                </button>
              }
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <SubDealerTable statusFilter={statusFilter} />
        </div>
      </div>
    </DashboardLayout>
  );
}
