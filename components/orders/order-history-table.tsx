"use client";

import { useState, useEffect, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Edit, Plus, Minus, PackageCheck } from "lucide-react";
import EditOrders from "@/components/manage_order/edit-order";
import {
  getInfluencerOrderFulfillments,
  getDistributorOrderFulfillments,
  fetchUsers,
} from "@/services/orders";

interface OrderHistoryTableProps {
  orders: any[];
  type: "dealer" | "sub-dealer";
  onUpdate?: () => void;
}

const statusStyles: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  accepted: "bg-green-100 text-green-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  inprogress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  dispatched: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
};

export default function OrderHistoryTable({
  orders,
  type,
  onUpdate,
}: OrderHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [allFulfillments, setAllFulfillments] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<
    Record<string, { name: string; distributorName: string }>
  >({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAllFulfillments();
    loadUsers();
  }, [type]);

  const loadUsers = async () => {
    try {
      const map = await fetchUsers();
      setUsersMap(
        map as Record<string, { name: string; distributorName: string }>,
      );
    } catch (error) {
      console.error("Error loading users for history table:", error);
    }
  };

  const loadAllFulfillments = async () => {
    try {
      const data: any =
        type === "sub-dealer"
          ? await getInfluencerOrderFulfillments()
          : await getDistributorOrderFulfillments();
      setAllFulfillments(data);
    } catch (error) {
      console.error("Error loading fulfillments for history table:", error);
    }
  };

  const toggleRow = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const getExactAverageRate = (orderId: string) => {
    // Strictly filter by order ID to match the View modal
    const relevant = allFulfillments.filter(
      (f: any) =>
        f.distributorOrderId === orderId || f.influencerOrderId === orderId,
    );

    if (relevant.length === 0) return null;

    const totalCost = relevant.reduce(
      (acc, f) => acc + (f.acceptedQtyTons || 0) * (f.rate || 0),
      0,
    );
    const totalQty = relevant.reduce(
      (acc, f) => acc + (f.acceptedQtyTons || 0),
      0,
    );

    return totalQty > 0 ? totalCost / totalQty : null;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatOnlyDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table className="w-full">
          {/* Header */}
          <TableHeader>
            <TableRow className="border-b bg-gray-50 hover:bg-gray-50">
              <TableHead className="px-4 py-4 text-gray-700 font-bold text-xs uppercase">
                S No.
              </TableHead>
              <TableHead className="px-4 py-4 text-gray-700 font-bold text-xs uppercase">
                Order ID
              </TableHead>
              <TableHead className="px-4 py-4 text-gray-700 font-bold text-xs uppercase">
                Order Date
              </TableHead>
              <TableHead className="px-4 py-4 text-gray-700 font-bold text-xs uppercase">
                Dispatch Date
              </TableHead>
              <TableHead className="px-4 py-4 text-gray-700 font-bold text-xs uppercase">
                {type === "dealer" ? "Sub Dealer" : "dealer"}
              </TableHead>
              {type === "sub-dealer" && (
                <TableHead className="px-4 py-4 text-gray-700 font-bold text-xs uppercase">
                  Sub dealer
                </TableHead>
              )}
              <TableHead className="px-4 py-4 text-gray-700 font-bold text-xs uppercase">
                Qty (Total)
              </TableHead>
              <TableHead className="px-4 py-4 text-gray-700 font-bold text-xs uppercase">
                Qty (Accpt)
              </TableHead>
              <TableHead className="px-4 py-4 text-gray-700 font-bold text-xs uppercase">
                Rate
              </TableHead>
              <TableHead className="px-4 py-4 text-gray-700 font-bold text-xs uppercase">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={type === "sub-dealer" ? 10 : 9}
                  className="text-center py-20 text-gray-500 italic"
                >
                  No orders found for this category.
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order, index) => {
                const isExpanded = expandedRows.has(order.id);
                const orderFulfillments = allFulfillments.filter(
                  (f: any) =>
                    f.distributorOrderId === order.id ||
                    f.influencerOrderId === order.id,
                );

                return (
                  <Fragment key={order.id}>
                    <TableRow
                      key={order.id}
                      className="hover:bg-gray-50 border-b"
                    >
                      {/* S No. */}
                      <TableCell className="px-4 py-4 text-sm font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>

                      {/* Order ID */}
                      <TableCell className="px-4 py-4 text-sm font-bold text-[#F87B1B]">
                        #{order.orderId || "N/A"}
                      </TableCell>

                      {/* Order Date */}
                      <TableCell className="px-4 py-4 text-sm whitespace-nowrap text-gray-500 font-medium">
                        {formatOnlyDate(order.createdAt)}
                      </TableCell>

                      {/* Dispatch Date */}
                      <TableCell className="px-4 py-4 text-sm whitespace-nowrap font-bold text-gray-700">
                        {formatOnlyDate(order.updatedAt || order.createdAt)}
                      </TableCell>

                      {/* Dealer/Sub Dealer Name */}
                      <TableCell className="px-4 py-4 text-sm font-semibold text-gray-800">
                        {usersMap[order.distributorId]?.name ||
                          order.distributorId ||
                          "Unknown"}
                      </TableCell>

                      {/* Parent Distributor Name - Only for Sub Dealers */}
                      {type === "sub-dealer" && (
                        <TableCell className="px-4 py-4 text-sm font-semibold text-gray-600">
                          {usersMap[order.distributorId]?.distributorName ||
                            "-"}
                        </TableCell>
                      )}

                      {/* Total Qty */}
                      <TableCell className="px-4 py-4 text-sm font-bold">
                        {order.totalQtyTons || 0}
                      </TableCell>

                      {/* Accepted Qty */}
                      <TableCell className="px-4 py-4 text-sm font-bold text-blue-600">
                        {order.fulfilledQtyTons || 0}
                      </TableCell>

                      {/* Rate */}
                      <TableCell className="px-4 py-4 text-sm font-bold text-green-600">
                        {["approved", "completed"].includes(
                          (order.status || "").toLowerCase(),
                        ) ? (
                          (() => {
                            const avg = getExactAverageRate(order.id);
                            return avg !== null ? (
                              <>{`₹ ${avg.toFixed(2)}`}</>
                            ) : (
                              <>₹ {order.rate || "0"}</>
                            );
                          })()
                        ) : (
                          <>₹ {order.rate || "0"}</>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-4 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-[10px] font-bold uppercase ${statusStyles[(order.status || "").toLowerCase()] || "bg-gray-100 text-gray-700"}`}
                          >
                            {order.status || "Pending"}
                          </Badge>
                          {orderFulfillments.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full hover:bg-orange-50 text-orange-600"
                              onClick={() => toggleRow(order.id)}
                            >
                              {isExpanded ? (
                                <Minus className="h-4 w-4" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded History Row */}
                    {isExpanded && orderFulfillments.length > 1 && (
                      <TableRow className="bg-orange-50/10 border-none hover:bg-orange-50/10 transition-all">
                        <TableCell
                          colSpan={type === "sub-dealer" ? 10 : 9}
                          className="p-0 border-none"
                        >
                          <div className="mx-4 mb-4 mt-0 bg-white rounded-lg border border-orange-100/50 shadow-sm overflow-hidden">
                            {/* Simple Table for Fulfillments */}
                            <Table className="w-full">
                              <TableHeader className="bg-orange-50/30">
                                <TableRow className="hover:bg-transparent border-b border-orange-50">
                                  <TableHead className="text-[10px] font-black uppercase text-gray-500 h-9 pl-6">
                                    Date
                                  </TableHead>
                                  <TableHead className="text-[10px] font-black uppercase text-gray-500 h-9">
                                    Qty (ton)
                                  </TableHead>
                                  <TableHead className="text-[10px] font-black uppercase text-gray-500 h-9">
                                    Rate
                                  </TableHead>
                                  <TableHead className="text-[10px] font-black uppercase text-gray-500 h-9 pr-6 text-right">
                                    Status
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {orderFulfillments.map((f: any, idx) => (
                                  <TableRow
                                    key={f.id}
                                    className={`${idx === orderFulfillments.length - 1 ? "" : "border-b border-gray-50"} hover:bg-orange-50/30 transition-colors`}
                                  >
                                    <TableCell className="py-2.5 pl-6 text-[12px] font-medium text-gray-600">
                                      {formatOnlyDate(f.createdAt || f.date)}
                                    </TableCell>
                                    <TableCell className="py-2.5 text-[12px] font-bold text-gray-800">
                                      {f.acceptedQtyTons}
                                    </TableCell>
                                    <TableCell className="py-2.5 text-[12px] font-bold text-green-700">
                                      ₹ {f.rate?.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="py-2.5 pr-6 text-right">
                                      <Badge
                                        variant="outline"
                                        className={`text-[9px] font-black uppercase h-5 px-2 border-none ${
                                          [
                                            "dispatched",
                                            "accepted",
                                            "completed",
                                          ].includes(
                                            (f.status || "").toLowerCase(),
                                          )
                                            ? "bg-green-100 text-green-700"
                                            : "bg-orange-50 text-[#F87B1B]"
                                        }`}
                                      >
                                        {[
                                          "dispatched",
                                          "accepted",
                                          "completed",
                                        ].includes(
                                          (f.status || "").toLowerCase(),
                                        )
                                          ? "Completed"
                                          : f.status}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer - Total Order */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t bg-gray-50 gap-4">
        <div className="text-gray-700 font-bold text-sm">
          Total Orders found : {orders.length}
        </div>

        {/* Pagination Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="text-[#F87B1B] border-[#F87B1B] hover:bg-[#F87B1B1A]"
          >
            Previous
          </Button>
          <div className="flex gap-1">
            {(() => {
              const pages = [];
              const groupSize = 3;
              const groupIndex = Math.floor((currentPage - 1) / groupSize);
              const startPage = groupIndex * groupSize + 1;
              const endPage = Math.min(totalPages, startPage + groupSize - 1);

              for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
              }
              return pages.map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page
                      ? "bg-[#F87B1B] text-white"
                      : "text-[#F87B1B] border-[#F87B1B] hover:bg-[#F87B1B1A]"
                  }
                >
                  {page}
                </Button>
              ));
            })()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="text-[#F87B1B] border-[#F87B1B] hover:bg-[#F87B1B1A]"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
