"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import OrdersTable, { Order } from "@/components/manage_order/orders_table";
import { Plus, Loader2, Search, Download } from "lucide-react";
import {
  getInfluencerOrders,
  getDistributorOrders,
  fetchUsers,
} from "@/services/orders";
import * as XLSX from "xlsx";

interface OrderViewProps {
  type: "dealer" | "sub-dealer";
}

export default function OrderView({ type }: OrderViewProps) {
  const [activeTab, setActiveTab] = useState("All");
  const [statusFilter, setStatusFilter] = useState(
    "pending,inprogress,processing",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [data, uMap] = await Promise.all([
        (type === "sub-dealer"
          ? getInfluencerOrders()
          : getDistributorOrders()) as Promise<Order[]>,
        fetchUsers(),
      ]);
      setOrders(data);
      setUsersMap(uMap);
      applyFilters(data, activeTab, statusFilter, searchTerm, uMap);
    } catch (error) {
      console.error(`Failed to fetch ${type} orders:`, error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    allOrders: Order[],
    tab: string,
    status: string,
    search: string,
    uMap: Record<string, any> = usersMap,
  ) => {
    let result = [...allOrders];

    // Date Filter (Today vs All)
    if (tab === "Today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter((order) => {
        const orderDate = order.createdAt?.toDate
          ? order.createdAt.toDate()
          : new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
    }

    // Status Filter
    if (status !== "all") {
      const statuses = status.split(",").map((s) => s.trim().toLowerCase());
      result = result.filter((order) =>
        statuses.includes((order.status || "").toLowerCase()),
      );
    }

    // Search Filter
    if (search.trim()) {
      const query = search.toLowerCase();

      const formatDate = (date: any) => {
        if (!date) return "";
        try {
          const d = date.toDate ? date.toDate() : new Date(date);
          if (isNaN(d.getTime())) return "";
          return d
            .toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            .toLowerCase();
        } catch (e) {
          return "";
        }
      };

      result = result.filter((order) => {
        const subDealerName = (
          uMap[order.influencerId || ""]?.name || ""
        ).toLowerCase();
        const dealerName = (
          uMap[order.distributorId || ""]?.name || ""
        ).toLowerCase();
        const formattedDate = formatDate(order.createdAt);
        const qty = (order.totalQtyTons || 0).toString();

        return (
          (order.distributorId || "").toLowerCase().includes(query) ||
          dealerName.includes(query) ||
          (order.orderId || "").toLowerCase().includes(query) ||
          (order.mobileNumber || "").toLowerCase().includes(query) ||
          (order.location || "").toLowerCase().includes(query) ||
          (order.influencerId || "").toLowerCase().includes(query) ||
          subDealerName.includes(query) ||
          formattedDate.includes(query) ||
          qty.includes(query)
        );
      });
    }

    setFilteredOrders(result);
  };

  const exportToExcel = () => {
    const formatDateObj = (timestamp: any) => {
      if (!timestamp) return "-";
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const dataToExport = filteredOrders.map((order, index) => {
      const dealerName =
        usersMap[order.distributorId || ""]?.name ||
        order.distributorId ||
        "N/A";
      const subDealerName =
        type === "sub-dealer"
          ? usersMap[order.influencerId || ""]?.name ||
            order.influencerId ||
            "N/A"
          : undefined;

      const rowData: any = {
        "S No.": index + 1,
        "Order ID": order.orderId || "N/A",
        "Order Date": formatDateObj(order.createdAt),
        Dealer: dealerName,
      };

      if (type === "dealer") {
        rowData["Validity Period"] = order.validity_period || "-";
      }

      if (type === "sub-dealer") {
        rowData["Sub Dealer"] = subDealerName;
      }

      rowData["Mobile"] = order.mobileNumber || "-";
      rowData["Qty (Ton)"] = order.totalQtyTons || 0;
      rowData["Fulfilled"] = order.fulfilledQtyTons || 0;
      rowData["Pending"] = order.pendingQtyTons || 0;
      rowData["Rate"] = order.rate ? `₹ ${order.rate}` : "₹ 0";
      rowData["Status"] = (order.status || "Pending").toUpperCase();

      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, `${type}_orders_export.xlsx`);
  };

  useEffect(() => {
    fetchOrders();
  }, [type]);

  useEffect(() => {
    applyFilters(orders, activeTab, statusFilter, searchTerm);
  }, [activeTab, statusFilter, orders, searchTerm]);

  return (
    <DashboardLayout>
      {/* ================= TOP SECTION ================= */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("Today")}
              className="px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors"
              style={
                activeTab === "Today"
                  ? { backgroundColor: "#F87B1B1A", color: "#F87B1B" }
                  : { color: "#F87B1B" }
              }
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab("All")}
              className="px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors"
              style={
                activeTab === "All"
                  ? { backgroundColor: "#F87B1B1A", color: "#F87B1B" }
                  : { color: "#F87B1B" }
              }
            >
              All Orders
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
          <div className="relative w-full sm:w-[320px]">
            <input
              type="text"
              placeholder="Search by ID, name, mobile, date or qty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2.5 pl-10 pr-4 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F87B1B] bg-white text-gray-700"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 capitalize">
          {type} Orders
        </h2>

        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#F87B1B]" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <OrdersTable
              orders={filteredOrders}
              orderSource={type}
              onUpdate={fetchOrders}
            />
            <div className="flex justify-end border-t pt-4">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-6 py-2 bg-[#F87B1B] text-white rounded-lg font-semibold hover:bg-[#e66a15] transition-colors"
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
