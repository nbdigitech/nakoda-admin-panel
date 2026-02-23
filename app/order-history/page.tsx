"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import OrderHistoryTable from "@/components/orders/order-history-table";
import { getInfluencerOrders, getDistributorOrders } from "@/services/orders";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OrderHistoryPage() {
  const [activeTab, setActiveTab] = useState("Dealer");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = ["Dealer", "Sub Dealer"];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data: any =
        activeTab === "Sub Dealer"
          ? await getInfluencerOrders()
          : await getDistributorOrders();
      setOrders(data);
    } catch (error) {
      console.error(`Failed to fetch ${activeTab} orders:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  // Apply status filter locally if needed
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter(
          (o) => (o.status || "").toLowerCase() === statusFilter.toLowerCase(),
        );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Tabs and Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg p-4 gap-4">
          <div className="flex gap-6 border-b w-full sm:w-auto overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-2 font-medium text-sm transition whitespace-nowrap ${
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
            <SelectTrigger className="w-full sm:w-40 border-0 bg-orange-50 text-[#F87B1B] font-semibold">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inprogress">In Progress</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center p-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#F87B1B]" />
            </div>
          ) : (
            <OrderHistoryTable
              orders={filteredOrders}
              type={activeTab === "Dealer" ? "dealer" : "sub-dealer"}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
