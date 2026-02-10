"use client"

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MapPin, CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface UpdateRemarkDrawerProps {
  surveyId: string
  currentRemark?: string
  trigger?: React.ReactNode
}

export default function UpdateRemarkDrawer({
  surveyId,
  currentRemark = "",
  trigger = <button className="text-[#F87B1B] hover:text-[#F87B1B] font-bold">Remark</button>,
}: UpdateRemarkDrawerProps) {
  const [remark, setRemark] = useState(currentRemark)
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 0, 21)) // Jan 21, 2026
  const [orgName, setOrgName] = useState("")
  const [name, setName] = useState("")
  const [designation, setDesignation] = useState("")
  const [mobile, setMobile] = useState("")
  const [altMobile, setAltMobile] = useState("")
  const [email, setEmail] = useState("")
  const [location, setLocation] = useState("")
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle remark update
    console.log("Updating survey", surveyId, {
      orgName,
      name,
      designation,
      mobile,
      altMobile,
      email,
      location,
      date,
      remark
    })
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-[426px] p-0 flex flex-col [&>button]:hidden">
        {/* Orange Header */}
        <div className="flex justify-items-center justify-between bg-[#F87B1B] text-white px-6 py-4">
          <h2 className="text-lg font-bold">Update Remark</h2>
          <p className="text-sm font-semibold">Survey ID<br/> #{surveyId}</p>
        </div>
        <div className="p-4 space-y-4 flex-1 overflow-y-auto text-[#929292]">
          
          {/* Organization Name */}
          <div>
            <label className="text-xs ">Organization Name</label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:border-[#F87B1B]  "
            />
          </div>

          {/* Name */}
          <div>
            <label className="text-xs ">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm  focus:border-[#F87B1B] "
            />
          </div>

          {/* Designation */}
          <div>
            <label className="text-xs ">Designation</label>
            <input
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm  focus:border-[#F87B1B] "
            />
          </div>

          {/* Mobile No */}
          <div>
            <label className="text-xs ">Mobile No.</label>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm  focus:border-[#F87B1B] "
            />
          </div>

          {/* Alternate Mobile */}
          <div>
            <label className="text-xs ">Alternate Mobile</label>
            <input
              value={altMobile}
              onChange={(e) => setAltMobile(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm  focus:border-[#F87B1B] "
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs ">Email Id</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm  focus:border-[#F87B1B] "
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-xs ">Location</label>
            <div className="relative mt-1">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm  pr-10 focus:border-[#F87B1B] focus:border-2"
              />
              <MapPin
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs ">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-1 justify-start text-left font-normal focus:border-[#F87B1B] focus:ring-[#F87B1B]"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd MMM yyyy") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Remark */}
          <div>
            <label className="text-xs">Remark</label>
            <Textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter your remark here..."
              className="min-h-[80px] mt-1"
            />
          </div>

          {/* Button */}
          <button className="w-full bg-[#F87B1B] hover:bg-[#e86f12] text-white py-3 rounded-lg font-semibold text-sm">
            Submit Remark
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}