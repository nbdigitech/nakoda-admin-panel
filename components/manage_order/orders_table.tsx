"use client";

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
import { Edit, MessageSquare } from "lucide-react";
import EditOrders from "./edit-order";

export interface Order {
  id: string;
  orderId: string;
  createdAt: any;
  distributorName: string;
  totalQtyTons: number;
  fulfilledQtyTons: number;
  pendingQtyTons: number;
  location: string;
  mobileNumber: string;
  rate: string;
  status: string;
}

interface OrdersTableProps {
  orders: Order[];
}

const statusStyles: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function OrdersTable({ orders }: OrdersTableProps) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        {/* Header */}
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-4 font-bold text-xs">S No.</TableHead>
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
              Location
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
            <TableHead className="px-4 py-4 font-bold text-xs">Rate</TableHead>
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
          {orders.map((order, index) => (
            <TableRow key={order.id} className="hover:bg-gray-50">
              <TableCell className="px-4 py-4 text-sm">{index + 1}</TableCell>
              <TableCell className="px-4 py-4 text-sm font-medium">
                {order.orderId || "N/A"}
              </TableCell>

              <TableCell className="px-4 py-4 text-sm">
                {formatDate(order.createdAt)}
              </TableCell>
              <TableCell className="px-4 py-4 text-sm">
                {order.distributorName || "Unknown"}
              </TableCell>
              <TableCell className="px-4 py-4 text-sm">
                {order.mobileNumber || "-"}
              </TableCell>
              <TableCell className="px-4 py-4 text-sm">
                {order.location || "-"}
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
                ₹ {order.rate || "0"}
              </TableCell>

              {/* Status */}
              <TableCell className="px-4 py-4">
                <Badge
                  className={`text-[10px] font-bold uppercase ${statusStyles[(order.status || "").toLowerCase()] || "bg-gray-100 text-gray-700"}`}
                >
                  {order.status || "Pending"}
                </Badge>
              </TableCell>

              {/* Action */}
              <TableCell className="px-4 py-4">
                <EditOrders
                  order={order}
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
