"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Edit, ChevronDown } from "lucide-react"

interface ExpenseRemarkDrawerProps {
  routeId: number
  routeTitle: string
  currentRemarks: string
  currentTotalExpense: number
  currentStatus: string
  onUpdateRemarks: (routeId: number, remarks: string, totalExpense: number, status: string) => void
  trigger?: React.ReactNode
}

export default function ExpenseRemarkDrawer({
  routeId,
  routeTitle,
  currentRemarks,
  currentTotalExpense,
  currentStatus,
  onUpdateRemarks,
  trigger = (
    <button className="bg-[#F87B1B] hover:bg-[#e86f12] text-white font-semibold flex items-center px-4 py-2 rounded-lg gap-2">
      <Edit className="w-4 h-4" />
      Remark
    </button>
  ),
}: ExpenseRemarkDrawerProps) {
  const [remark, setRemark] = useState(currentRemarks)
  const [status, setStatus] = useState(currentStatus)
  const [amount, setAmount] = useState(currentTotalExpense.toString())
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setRemark(currentRemarks)
      setStatus(currentStatus)
      setAmount(currentTotalExpense.toString())
    }
  }, [open, currentRemarks, currentStatus, currentTotalExpense])

  const handleSubmit = () => {
    const totalExpense = parseFloat(amount) || 0
    onUpdateRemarks(routeId, remark, totalExpense, status)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>

      <SheetContent className="w-[420px] p-0 flex flex-col [&>button]:hidden">
        {/* ===== Header ===== */}
        <div className="bg-[#F87B1B] text-white px-6 py-4">
          <h2 className="text-lg font-bold">Expense Remark</h2>
        </div>

        {/* ===== Body ===== */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Route */}
          <div>
            <p className="text-sm font-semibold text-[#F87B1B]">
              {routeTitle}
            </p>
            <p className="text-xs text-gray-400">19 Jan 2026</p>
          </div>

          {/* Total Expense */}
          <div>
            <label className="text-xs text-gray-500">Total Expense</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-1 px-4 py-3 border rounded-lg text-sm focus:border-[#F87B1B] outline-none"
              placeholder="Enter amount"
            />
          </div>

          {/* Remark */}
          <div>
            <label className="text-xs text-gray-500">Remark</label>
            <Textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="mt-1 min-h-[120px] resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-gray-500">Status</label>
            <div className="relative mt-1">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg text-sm appearance-none focus:border-[#F87B1B] outline-none"
              >
                <option>Approved</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F87B1B]" />
            </div>
          </div>
        </div>

        {/* ===== Footer Button ===== */}
        <div className="px-6 pb-6">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#F87B1B] hover:bg-[#e86f12] text-white py-3 rounded-lg font-semibold"
          >
            Submit Remark
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
