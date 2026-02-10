"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import Image from "next/image"

interface Staff {
  id: number
  dealerName: string
  contact: string
  company: string
  district: string
  email: string
  referenceBy: string
  pdf: boolean
  pancard: boolean
  gst: boolean
}

const dealers: Staff[] = [
  {
    id: 1,
    dealerName: "Kunal Sahu",
    contact: "9405005285",
    company: "Kunal Enterprises",
    district: "Raipur",
    email: "Kunal@gmail.Com",
    referenceBy: "Akash",
    pdf: true,
    pancard: true,
    gst: true,
  },
  {
    id: 2,
    dealerName: "Vijay Agrowal",
    contact: "9405005285",
    company: "Vijay Trading",
    district: "Korba",
    email: "Vijay@gmail.Com",
    referenceBy: "Ravi",
    pdf: true,
    pancard: true,
    gst: true,
  },
  {
    id: 3,
    dealerName: "Deepak Joshi",
    contact: "9405005285",
    company: "Deepak Traders",
    district: "Bilaspur",
    email: "Joshi@gmail.Com",
    referenceBy: "Hitesh",
    pdf: true,
    pancard: true,
    gst: true,
  },
]

export default function StaffTable() {
  return (
    <div className="">
      <Table className="">
        {/* Header */}
        <TableHeader>
          <TableRow className="">
            <TableHead className="px-4 py-4 text-left text-sm font-bold ">
              S No.
            </TableHead>
            <TableHead className="px-4 py-4 text-left text-sm font-bold ">
              Dealer Name
            </TableHead>
            <TableHead className="px-4 py-4 text-left text-sm font-bold ">
              Contact
            </TableHead>
            <TableHead className="px-4 py-4 text-left text-sm font-bold ">
              Company
            </TableHead>
            <TableHead className="px-4 py-4 text-left text-sm font-bold ">
              District
            </TableHead>
            <TableHead className="px-4 py-4 text-left text-sm font-bold ">
              E-Mail
            </TableHead>
            <TableHead className="px-4 py-4 text-left text-sm font-bold ">
             ASM Area
            </TableHead>
            <TableHead className="px-4 py-4 text-left text-sm font-bold ">
              PDF
            </TableHead>
            <TableHead className="px-4 py-4 text-left text-sm font-bold ">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>

        {/* Body */}
        <TableBody>
          {dealers.map((dealer) => (
            <TableRow
              key={dealer.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <TableCell className="px-4 py-4 text-sm text-[#44444A]">
                {dealer.id}
              </TableCell>
              <TableCell className="px-4 py-4 text-sm text-[#44444A]">
                {dealer.dealerName}
              </TableCell>
              <TableCell className="px-4 py-4 text-sm text-[#44444A]">
                {dealer.contact}
              </TableCell>
              <TableCell className="px-4 py-4 text-sm text-[#44444A]">
                {dealer.company}
              </TableCell>
              <TableCell className="px-4 py-4 text-sm text-[#44444A]">
                {dealer.district}
              </TableCell>
              <TableCell className="px-4 py-4 text-sm text-[#44444A]">
                {dealer.email}
              </TableCell>
              <TableCell className="px-4 py-4 text-sm text-[#44444A]">
                {dealer.referenceBy}
              </TableCell>
              <TableCell className="px-4 py-4 text-sm">
                <div className="flex gap-2">
                 {dealer.pancard && (
                                 <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                                   <Image
                                     src="/pdf icon.png"
                                     alt="Pancard PDF"
                                     width={22}
                                     height={22}
                                   />
                                   <span className="text-sm text-gray-700 font-medium">
                                     Pancard 
                                   </span>
                                 </div>
                               )}
                             </div>
                           </TableCell>
              <TableCell className="px-4 py-4">
  <Button
    variant="ghost"
    className="flex items-center gap-2 text-[#F87B1B] font-semibold px-3 py-2 rounded-lg hover:bg-[#F87B1B1A]"
    style={{ backgroundColor: '#F87B1B1A' }}
  >
    <Eye size={16} />
    View
  </Button>
</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
