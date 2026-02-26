"use client";

import { useState, useEffect } from "react";
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
import { Edit, Loader2, Eye } from "lucide-react";
import EditOrders from "./edit-order";
import ViewFulfillment from "./view-fulfillment";
import { useRouter } from "next/navigation";
import {
  getInfluencerOrderFulfillments,
  getDistributorOrderFulfillments,
  updateOrder,
} from "@/services/orders";
import { useToast } from "@/hooks/use-toast";

export interface Order {
  id: string;
  orderId: string;
  createdAt: any;
  distributorId: string;
  totalQtyTons: number;
  fulfilledQtyTons: number;
  pendingQtyTons: number;
  location: string;
  mobileNumber: string;
  rate: string;
  status: string;
  averageRate?: number;
}

interface OrdersTableProps {
  orders: Order[];
  orderSource: "dealer" | "sub-dealer";
  onUpdate?: () => void;
}

const statusStyles: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  accepted: "bg-green-100 text-green-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  inprogress: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
};

export default function OrdersTable({
  orders,
  orderSource,
  onUpdate,
}: OrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const router = useRouter();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [allFulfillments, setAllFulfillments] = useState<any[]>([]);

  useEffect(() => {
    loadAllFulfillments();
  }, [orderSource]);

  const loadAllFulfillments = async () => {
    try {
      const data: any =
        orderSource === "sub-dealer"
          ? await getInfluencerOrderFulfillments()
          : await getDistributorOrderFulfillments();
      setAllFulfillments(data);
    } catch (error) {
      console.error("Error loading fulfillments for table:", error);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [orders]);

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

  const handleProcessingClick = async (order: Order) => {
    try {
      setUpdatingId(order.id);
      const collectionName =
        orderSource === "dealer" ? "distributor_orders" : "influencer_orders";

      await updateOrder(collectionName, order.id, {
        status: "approved",
      });

      toast({
        title: "Order Completed",
        description: "The order has been moved to history.",
      });

      if (onUpdate) onUpdate();
      loadAllFulfillments();
      router.push("/order-history");
    } catch (error) {
      console.error("Error completing order:", error);
      toast({
        title: "Error",
        description: "Failed to complete the order.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table>
          {/* Header */}
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-4 font-bold text-xs">
                S No.
              </TableHead>
              <TableHead className="px-4 py-4 font-bold text-xs">
                Order ID
              </TableHead>
              <TableHead className="px-4 py-4 font-bold text-xs">
                Order Date
              </TableHead>
              <TableHead className="px-4 py-4 font-bold text-xs">
                Distributor
              </TableHead>
              <TableHead className="px-4 py-4 font-bold text-xs">
                Mobile
              </TableHead>

              <TableHead className="px-4 py-4 font-bold text-xs">
                Qty (Tons)
              </TableHead>
              <TableHead className="px-4 py-4 font-bold text-xs">
                Fulfilled
              </TableHead>
              <TableHead className="px-4 py-4 font-bold text-xs">
                Pending
              </TableHead>
              <TableHead className="px-4 py-4 font-bold text-xs">
                Rate
              </TableHead>
              <TableHead className="px-4 py-4 font-bold text-xs">
                Status
              </TableHead>
              <TableHead className="px-4 py-4 font-bold text-xs">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody>
            {paginatedOrders.map((order, index) => (
              <TableRow key={order.id} className="hover:bg-gray-50">
                <TableCell className="px-4 py-4 text-sm">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell className="px-4 py-4 text-sm font-medium">
                  {order.orderId || "N/A"}
                </TableCell>

                <TableCell className="px-4 py-4 text-sm">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="px-4 py-4 text-sm">
                  {order.distributorId?.slice(0, 6) + "..." || "N/A"}
                </TableCell>
                <TableCell className="px-4 py-4 text-sm">
                  {order.mobileNumber || "-"}
                </TableCell>

                <TableCell className="px-4 py-4 text-sm">
                  {order.totalQtyTons || 0}t
                </TableCell>
                <TableCell className="px-4 py-4 text-sm">
                  {order.fulfilledQtyTons || 0}t
                </TableCell>
                <TableCell className="px-4 py-4 text-sm">
                  {order.pendingQtyTons || 0}t
                </TableCell>
                <TableCell className="px-4 py-4 text-sm font-semibold text-green-600">
                  {(order.status || "").toLowerCase() === "processing" ? (
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
                <TableCell className="px-4 py-4">
                  {(order.status || "").toLowerCase() === "processing" ? (
                    <Button
                      size="sm"
                      onClick={() => handleProcessingClick(order)}
                      disabled={updatingId === order.id}
                      className="text-[10px] font-bold uppercase bg-purple-100 text-purple-700 hover:bg-purple-200 border-none h-7 px-3"
                    >
                      {updatingId === order.id ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : null}
                      {order.status || "Processing"}
                    </Button>
                  ) : (
                    <Badge
                      className={`text-[10px] font-bold uppercase ${statusStyles[(order.status || "").toLowerCase()] || "bg-gray-100 text-gray-700"}`}
                    >
                      {order.status || "Pending"}
                    </Badge>
                  )}
                </TableCell>

                {/* Action */}
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <ViewFulfillment
                      orderId={order.id}
                      displayId={order.orderId}
                      distributorId={order.distributorId}
                      orderSource={orderSource}
                    />

                    {(order.status || "").toLowerCase() ===
                    "processing" ? null : ["approved", "rejected"].includes(
                        (order.status || "").toLowerCase(),
                      ) ? (
                      <Button
                        variant="ghost"
                        disabled
                        className="flex items-center gap-2 text-gray-400 px-3 py-2 rounded-lg font-semibold cursor-not-allowed"
                        style={{ backgroundColor: "#F3F4F6" }}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Order
                      </Button>
                    ) : (
                      <EditOrders
                        order={order}
                        orderSource={orderSource}
                        onUpdate={() => {
                          if (onUpdate) onUpdate();
                          loadAllFulfillments();
                        }}
                        trigger={
                          <Button
                            variant="ghost"
                            className="flex items-center gap-2 text-[#F87B1B] px-3 py-2 rounded-lg font-semibold hover:bg-[#F87B1B1A]"
                            style={{ backgroundColor: "#F87B1B1A" }}
                          >
                            <Edit className="w-4 h-4" />
                            Edit Order
                          </Button>
                        }
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 py-4 border-t mt-4">
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
                  ? "bg-[#F87B1B] text-white hover:bg-[#e66a15]"
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
  );
}
