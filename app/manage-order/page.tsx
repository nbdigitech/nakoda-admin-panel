"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/dashboard-layout";
import AddDealerModal from "@/components/dealer/add-dealer-modal";
import OrdersTable, { Order } from "@/components/manage_order/orders_table";
import { Plus, Loader2 } from "lucide-react";
import { getInfluencerOrders } from "@/services/orders";

export default function ManageOrder() {
  const [activeTab, setActiveTab] = useState("Today");
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data: any = await getInfluencerOrders();
      setOrders(data);
      applyFilter(data, activeTab);
    } catch (error) {
      console.error("Failed to fetch influencer orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (allOrders: Order[], tab: string) => {
    if (tab === "Today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const filtered = allOrders.filter((order) => {
        const orderDate = order.createdAt?.toDate
          ? order.createdAt.toDate()
          : new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(allOrders);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilter(orders, activeTab);
  }, [activeTab, orders]);

  return (
    <DashboardLayout>
      {/* ================= TOP SECTION ================= */}
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
            All Orders
          </button>
        </div>

        <div className="flex items-center ">
          <select
            className="w-[180px] py-3 px-3 mr-4 border text-[#F87B1B] rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#F87B1B]"
            style={{ backgroundColor: "#F87B1B1A" }}
          >
            <option>All</option>
          </select>
          <AddDealerModal
            trigger={
              <button className="bg-[#c8efd9] text-sm text-[#009846] font-bold py-3 px-12 rounded-lg flex items-center  transition-colors ">
                <Plus className="w-5 h-5 mr-1" />
                Add Order
              </button>
            }
          />
        </div>
      </div>

      {/* ================= TABLE ================= */}
      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#F87B1B]" />
        </div>
      ) : (
        <OrdersTable orders={filteredOrders} />
      )}
    </DashboardLayout>
  );
}
