"use client"

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface EditOrderDrawerProps {
  orderId: string
  dealerName: string
  qty?: string
  shipto?: string
  trigger?: React.ReactNode
}

export default function EditOrders({
  orderId,
  dealerName,
  qty = "550 Ton",
  shipto = "45,000",
  trigger = <button className="text-[#F87B1B] hover:text-[#F87B1B] font-bold">Edit</button>,
}: EditOrderDrawerProps) {
  const [dealerNameState, setDealerNameState] = useState(dealerName)
  const [mobileNo, setMobileNo] = useState("9450800845")
  const [qtyState, setQtyState] = useState(qty)
  const [partialOrder, setPartialOrder] = useState("400 Ton")
  const [progress, setProgress] = useState("In Progress")
  const [message, setMessage] = useState(
    "You Are About To Cancel This Order. This Action is Permanent And May Update Inventory And Payment Records.",
  )
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-[426px] p-0 flex flex-col [&>button]:hidden">
        {/* Remove Close Button */}
        {/* Orange Header */}
        <div className="flex justify-items-center justify-between bg-[#F87B1B] text-white px-6 py-4">
          <h2 className="text-lg font-bold">Edit Order</h2>
          <p className="text-sm font-semibold ">Order id<br/> #{orderId}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 flex-1 overflow-y-auto">
          {/* Dealer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dealer Name</label>
            <input
              type="text"
              value={dealerNameState}
              onChange={(e) => setDealerNameState(e.target.value)}
              className="w-full  px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:border-[#F87B1B] transition-colors"
            />
          </div>

          {/* Mobile No. */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile No.</label>
            <input
              type="text"
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:border-[#F87B1B] transition-colors"
            />
          </div>

          {/* Qty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Qty</label>
            <input
              type="text"
              value={qtyState}
              onChange={(e) => setQtyState(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:border-[#F87B1B] transition-colors"
            />
          </div>

          {/* Partial Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Partial Order</label>
            <input
              type="text"
              value={partialOrder}
              onChange={(e) => setPartialOrder(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:border-[#F87B1B] transition-colors"
            />
          </div>

          {/* Pending Amount */}
          <div className="text-right -mt-2">
            <p className="text-sm font-semibold text-[#F87B1B]">Pending 150 Ton</p>
          </div>

          {/* Progress Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
            <select
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#F87B1B]  cursor-pointer bg-white text-[#F87B1B] font-semibold transition-colors"
            >
              <option>In Progress</option>
              <option>Pending</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#F87B1B] resize-none text-sm text-gray-600 transition-colors"
              placeholder="Enter order message..."
            />
          </div>

          {/* Rate Display */}
          <div className="text-center py-4">
            <p className="text-sm font-semibold text-[#009846]">Rate : ₹ {shipto}</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#F87B1B] hover:bg-[#e86a0a] text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Update Order
          </button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
