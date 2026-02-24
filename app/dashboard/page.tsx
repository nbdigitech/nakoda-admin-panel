"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DashboardCards from "@/components/dashboard/dashboard-cards";
import OrderChart from "@/components/dashboard/order-chart";
import { Button } from "@/components/ui/button";
import OrdersTable, { Order } from "@/components/manage_order/orders_table";
import TodayRateCard from "@/components/dashboard/TodayRateCard";
import { Plus, Search, Loader2 } from "lucide-react";
import { getDashboardAnalytics } from "@/services/dashboard";
import { getInfluencerOrders, getDistributorOrders } from "@/services/orders";

const tabs = ["Today", "Pending", "Dispatch", "Cancelled", "Completed"];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Dealer");
  const [analytics, setAnalytics] = useState<any>(null);

  // Order List State
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const cached = sessionStorage.getItem("dashboardStats");
        if (cached) {
          setAnalytics(JSON.parse(cached));
          sessionStorage.removeItem("dashboardStats"); // Optional: clear so manual refresh gets new data
          return;
        }

        const res = await getDashboardAnalytics();
        if (res?.data) {
          setAnalytics(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard analytics:", error);
      }
    };
    fetchAnalytics();
  }, []);

  const fetchOrders = async () => {
    try {
      if (activeTab === "Dealer") {
        const cachedOrders = sessionStorage.getItem("dashboardOrders");
        if (cachedOrders) {
          setOrders(JSON.parse(cachedOrders));
          setLoading(false);
          sessionStorage.removeItem("dashboardOrders");
          return;
        }
      }

      setLoading(true);
      const data: any =
        activeTab === "Sub Dealer"
          ? await getInfluencerOrders()
          : await getDistributorOrders();
      setOrders(data);
    } catch (error) {
      console.error(`Failed to fetch orders:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  useEffect(() => {
    let result = [...orders];

    if (statusFilter !== "all") {
      result = result.filter(
        (o) => (o.status || "").toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          (o.orderId || "").toLowerCase().includes(q) ||
          (o.distributorId || "").toLowerCase().includes(q) ||
          (o.location || "").toLowerCase().includes(q) ||
          (o.mobileNumber || "").toLowerCase().includes(q),
      );
    }
    result.sort((a, b) => {
      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredOrders(result);
  }, [orders, statusFilter, searchTerm]);

  return (
    <DashboardLayout>
      <div className="mb-5">
        <TodayRateCard />
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-[0.7]">
          <DashboardCards data={analytics} />
        </div>

        {/* Chart Section - 30% */}
        <div className="flex-[0.3]">
          <OrderChart />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mt-10">
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
            Dealer
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
            Sub Dealer
          </button>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-[280px]">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2.5 pl-10 pr-4 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F87B1B] bg-white text-gray-700"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[150px] py-2.5 px-4 border text-[#F87B1B] rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#F87B1B] transition-colors"
            style={{ backgroundColor: "#F87B1B1A" }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="inprogress">In Progress</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* ================= ORDER TABLE ================= */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">
          Recent {activeTab} Orders
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#F87B1B]" />
            <p className="text-gray-500 font-medium text-sm">
              Loading orders...
            </p>
          </div>
        ) : (
          <OrdersTable
            orders={filteredOrders.slice(0, 10)}
            orderSource={activeTab === "Sub Dealer" ? "sub-dealer" : "dealer"}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
