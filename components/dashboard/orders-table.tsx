"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import EditOrderDrawer from "@/components/dashboard/edit-order-drawer"
import { Edit, MessageSquare } from "lucide-react"

export interface Order {
  id: number
  orderId: string
  orderDate: string
  dealerName: string
  qty: string
  rate: string
  status: "Pending" | "In Progress" | "Completed"
}

interface OrdersTableProps {
  orders: Order[]
}

const statusStyles: Record<Order["status"], string> = {
  Pending: "bg-orange-100 text-orange-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        {/* Header */}
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-4 font-bold">S No.</TableHead>
            <TableHead className="px-4 py-4 font-bold">Order ID</TableHead>
            <TableHead className="px-4 py-4 font-bold">Order Date</TableHead>
            <TableHead className="px-4 py-4 font-bold">Dealer Name</TableHead>
            <TableHead className="px-4 py-4 font-bold">Qty</TableHead>
            <TableHead className="px-4 py-4 font-bold">Rate</TableHead>
            <TableHead className="px-4 py-4 font-bold">Status</TableHead>
            <TableHead className="px-4 py-4 font-bold">Message</TableHead>
            <TableHead className="px-4 py-4 font-bold">Action</TableHead>
          </TableRow>
        </TableHeader>

        {/* Body */}
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="hover:bg-gray-50"
            >
              <TableCell className="px-4 py-4">{order.id}</TableCell>
              <TableCell className="px-4 py-4">{order.orderId}</TableCell>
              <TableCell className="px-4 py-4">{order.orderDate}</TableCell>
              <TableCell className="px-4 py-4">{order.dealerName}</TableCell>
              <TableCell className="px-4 py-4">{order.qty}</TableCell>
              <TableCell className="px-4 py-4">{order.rate}</TableCell>

              {/* Status */}
              <TableCell className="px-4 py-4">
                <Badge
                  className={`text-xs font-semibold ${statusStyles[order.status]}`}
                >
                  {order.status}
                </Badge>
              </TableCell>

              {/* Message */}
              <TableCell className="px-4 py-4">
                <div className="flex items-center gap-2 text-[#F87B1B] cursor-pointer hover:opacity-80">
                  <MessageSquare size={18} />
                  <span className="text-sm font-semibold">1</span>
                </div>
              </TableCell>

              {/* Action */}
              <TableCell className="px-4 py-4">
                <EditOrderDrawer
                  orderId={order.orderId}
                  dealerName={order.dealerName}
                  trigger={
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-[#F87B1B] px-3 py-2 rounded-lg font-semibold hover:bg-[#F87B1B1A]"
                      style={{ backgroundColor: '#F87B1B1A' }}
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
  )
}
