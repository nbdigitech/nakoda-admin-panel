"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import OrderHistoryTable from "@/components/orders/order-history-table";
import { getInfluencerOrders, getDistributorOrders } from "@/services/orders";
import { Loader2, Search } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
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

  // Apply filters locally
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (o) => (o.status || "").toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          (o.orderId || "").toLowerCase().includes(term) ||
          (o.distributorId || "").toLowerCase().includes(term) ||
          (o.mobileNumber || "").toLowerCase().includes(term),
      );
    }

    return result;
  }, [orders, statusFilter, searchTerm]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Order History</h1>

            <div className="relative w-full lg:w-[400px]">
              <input
                type="text"
                placeholder="Search by Order ID, Name or Mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87B1B] transition-all text-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between border-t pt-4 gap-4">
            <div className="flex gap-6 w-full sm:w-auto overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-2 font-bold text-sm transition whitespace-nowrap ${
                    activeTab === tab
                      ? "text-[#F87B1B] border-b-2 border-[#F87B1B]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 border-0 bg-orange-50 text-[#F87B1B] font-bold">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm min-h-[400px] overflow-hidden">
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
