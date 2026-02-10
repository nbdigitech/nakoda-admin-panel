"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Edit2, MessageSquare, Edit, X } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface OrderHistory {
  id: number
  sNo: number
  orderID: string
  orderDate: string
  dealerName: string
  qty: string
  shipTo: string
  status: "Completed" | "Processing" | "On Hold" | "Pending"
  message: number
}

const orders: OrderHistory[] = [
  {
    id: 1,
    sNo: 1,
    orderID: "#151056",
    orderDate: "5/12/2025",
    dealerName: "Avyaan Sahu",
    qty: "550t",
    shipTo: "Sankar Nagar Raipur",
    status: "Completed",
    message: 1,
  },
  {
    id: 2,
    sNo: 2,
    orderID: "#151056",
    orderDate: "5/12/2025",
    dealerName: "Arjun Kumar",
    qty: "550t",
    shipTo: "Ram Nagar Raipur",
    status: "Completed",
    message: 1,
  },
  {
    id: 3,
    sNo: 3,
    orderID: "#151056",
    orderDate: "5/12/2025",
    dealerName: "Jayant Singh",
    qty: "550t",
    shipTo: "Puroni Basti Raipur",
    status: "Completed",
    message: 1,
  },
]

const statusStyles: Record<OrderHistory["status"], string> = {
  Completed: "bg-green-100 text-green-800",
  Processing: "bg-orange-100 text-orange-800",
  "On Hold": "bg-gray-100 text-gray-800",
  Pending: "bg-red-100 text-red-800",
}

export default function OrderHistoryTable() {
  const [openDrawer, setOpenDrawer] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderHistory | null>(null)
  const [newStatus, setNewStatus] = useState<OrderHistory["status"]>("Completed")

  const handleEditClick = (order: OrderHistory) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setOpenDrawer(true)
  }

  const handleStatusChange = () => {
    // Here you would typically make an API call to update the order status
    console.log(`Order ${selectedOrder?.orderID} status changed to ${newStatus}`)
    setOpenDrawer(false)
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="p-6">
          <Table className="w-full">
            {/* Header */}
            <TableHeader>
              <TableRow className="border-b bg-white hover:bg-white">
                <TableHead className="px-4 py-4 text-gray-700 font-semibold">S No.</TableHead>
                <TableHead className="px-4 py-4 text-gray-700 font-semibold">Order ID</TableHead>
                <TableHead className="px-4 py-4 text-gray-700 font-semibold">Order Date</TableHead>
                <TableHead className="px-4 py-4 text-gray-700 font-semibold">Dealer Name</TableHead>
                <TableHead className="px-4 py-4 text-gray-700 font-semibold">Qty</TableHead>
                <TableHead className="px-4 py-4 text-gray-700 font-semibold">Ship to</TableHead>
                <TableHead className="px-4 py-4 text-gray-700 font-semibold">Status</TableHead>
                <TableHead className="px-4 py-4 text-gray-700 font-semibold">Message</TableHead>
                <TableHead className="px-4 py-4 text-gray-700 font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>

            {/* Body */}
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50 border-b">
                  {/* S No. */}
                  <TableCell className="px-4 py-4 text-sm">{order.sNo}</TableCell>

                  {/* Order ID */}
                  <TableCell className="px-4 py-4 text-sm font-medium">{order.orderID}</TableCell>

                  {/* Order Date */}
                  <TableCell className="px-4 py-4 text-sm">{order.orderDate}</TableCell>

                  {/* Dealer Name */}
                  <TableCell className="px-4 py-4 text-sm">{order.dealerName}</TableCell>

                  {/* Qty */}
                  <TableCell className="px-4 py-4 text-sm">{order.qty}</TableCell>

                  {/* Ship to */}
                  <TableCell className="px-4 py-4 text-sm">{order.shipTo}</TableCell>

                  {/* Status */}
                  <TableCell className="px-4 py-4">
                    <Badge className={`text-xs font-semibold px-3 py-1 ${statusStyles[order.status]}`}>
                      {order.status}
                    </Badge>
                  </TableCell>

                  {/* Message */}
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-2 text-orange-400">
                      <MessageSquare size={18} />
                      <span className="text-sm">{order.message}</span>
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="px-4 py-4">
                    <button
                      onClick={() => handleEditClick(order)}
                      className="flex items-center gap-1 text-[#F87B1B] hover:text-[#e86f12] transition"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-medium">Edit Order</span>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer - Total Order */}
        <div className="px-6 py-4 border-t text-gray-600 font-medium">
          Total Order : {orders.length}
        </div>
      </div>

      {/* Edit Order Status Drawer */}
      <Sheet open={openDrawer} onOpenChange={setOpenDrawer}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
          {/* Orange Header */}
          <div className="bg-[#F87B1B] text-white px-6 py-4 flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Edit Order</h2>
            <div>
              <p className="text-sm font-semibold">Order ID</p>
              <p className="text-sm font-semibold">{selectedOrder?.orderID}</p>
            </div>
          </div>

          <div className="space-y-5 px-6 flex-1 overflow-y-auto">
            {selectedOrder && (
              <>
                {/* Dealer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dealer Name</label>
                  <input
                    type="text"
                    value={selectedOrder.dealerName}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium"
                  />
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Change Status</label>
                  <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderHistory["status"])}>
                    <SelectTrigger className="w-full px-4 py-2 border-2 border-[#F87B1B] rounded-lg focus:outline-none focus:border-[#F87B1B] appearance-none cursor-pointer bg-white text-[#F87B1B] font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleStatusChange}
                  className="w-full bg-[#F87B1B] hover:bg-[#e86f12] text-white font-bold py-3 px-4 rounded-lg transition-colors mt-8"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    
    </>
  )
}
