"use client"

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

interface UpdateRateDrawerProps {
  trigger?: React.ReactNode
}

export default function UpdateRateDrawer({
  trigger = <button className="text-[#F87B1B] hover:text-[#F87B1B] font-bold">Update Rate</button>,
}: UpdateRateDrawerProps) {
  const [todayRate, setTodayRate] = useState("4,4500")
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 0, 18))
  const [updateRate, setUpdateRate] = useState("4,4650")
  const [status, setStatus] = useState("Active")
  const [open, setOpen] = useState(false)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)

  const difference = 150

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setDatePopoverOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-[426px] p-0 flex flex-col [&>button]:hidden">
        {/* Orange Header */}
        <div className="bg-[#F87B1B] text-white px-6 py-4">
          <h2 className="text-lg font-bold">Update Rate</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 flex-1 overflow-y-auto">
          {/* Today Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Today Rate</label>
            <input
              type="text"
              value={todayRate}
              onChange={(e) => setTodayRate(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:border-[#F87B1B] transition-colors"
              placeholder="Enter today rate"
            />
          </div>

          {/* Date with Calendar Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:border-[#F87B1B] flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span>{date ? format(date, "dd MMM yyyy") : "Pick a date"}</span>
                  <CalendarIcon className="w-5 h-5 text-[#F87B1B]" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Update Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Update Rate</label>
            <input
              type="text"
              value={updateRate}
              onChange={(e) => setUpdateRate(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:border-[#F87B1B] transition-colors"
              placeholder="Enter update rate"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#F87B1B] appearance-none cursor-pointer bg-white text-[#F87B1B] font-semibold transition-colors"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          {/* Spacer */}
          <div className="h-8" />

          {/* Difference Amount */}
          <div className="text-center py-6">
            <p className="text-lg font-semibold text-green-600">
              ₹ {difference} ▲
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#F87B1B] hover:bg-[#e86a0a] text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Update Rate
          </button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
