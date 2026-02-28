"use client";

import { useState } from "react";
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
import { MessageSquare, Edit } from "lucide-react";
import EditOrders from "@/components/manage_order/edit-order";
import { useEffect } from "react";
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
};

export default function OrderHistoryTable({
  orders,
  type,
  onUpdate,
}: OrderHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [allFulfillments, setAllFulfillments] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAllFulfillments();
    loadUsers();
  }, [type]);

  const loadUsers = async () => {
    try {
      const map = await fetchUsers();
      setUsersMap(map as Record<string, string>);
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
                {type === "dealer" ? "Distributor" : "Sub Dealer"}
              </TableHead>
              <TableHead className="px-4 py-4 text-gray-700 font-bold text-xs uppercase">
                Qty (ton)
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
                  colSpan={7}
                  className="text-center py-20 text-gray-500 italic"
                >
                  No orders found for this category.
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order, index) => (
                <TableRow key={order.id} className="hover:bg-gray-50 border-b">
                  {/* S No. */}
                  <TableCell className="px-4 py-4 text-sm font-medium">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>

                  {/* Order ID */}
                  <TableCell className="px-4 py-4 text-sm font-bold text-[#F87B1B]">
                    #{order.orderId || "N/A"}
                  </TableCell>

                  {/* Order Date */}
                  <TableCell className="px-4 py-4 text-sm whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </TableCell>

                  {/* Dealer/Sub Dealer Name */}
                  <TableCell className="px-4 py-4 text-sm font-semibold text-gray-800">
                    {usersMap[order.distributorId] ||
                      order.distributorId ||
                      "Unknown"}
                  </TableCell>

                  {/* Qty */}
                  <TableCell className="px-4 py-4 text-sm font-bold">
                    {order.totalQtyTons || 0}
                  </TableCell>

                  {/* Rate */}
                  <TableCell className="px-4 py-4 text-sm font-bold text-green-600">
                    {(order.status || "").toLowerCase() === "approved" ? (
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
                    <Badge
                      className={`text-[10px] font-bold uppercase ${statusStyles[(order.status || "").toLowerCase()] || "bg-gray-100 text-gray-700"}`}
                    >
                      {order.status || "Pending"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
            ))}
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
