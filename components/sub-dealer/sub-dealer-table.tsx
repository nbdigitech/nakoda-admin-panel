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
import Image from "next/image"
import { Eye } from "lucide-react"

interface Dealer {
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

const dealers: Dealer[] = [
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

export default function SubDealerTable() {
  return (
    <div className="">
      <Table className="">
        {/* Header */}
        <TableHeader>
          <TableRow className="">
            <TableHead className="px-3 py-2 text-left text-xs font-bold ">
              S No.
            </TableHead>
            <TableHead className="px-3 py-2 text-left text-xs font-bold ">
              Dealer Name
            </TableHead>
            <TableHead className="px-3 py-2 text-left text-xs font-bold ">
              Contact
            </TableHead>
            <TableHead className="px-3 py-2 text-left text-xs font-bold ">
              Company
            </TableHead>
            <TableHead className="px-3 py-2 text-left text-xs font-bold ">
              District
            </TableHead>
            <TableHead className="px-3 py-2 text-left text-xs font-bold ">
              E-Mail
            </TableHead>
            <TableHead className="px-3 py-2 text-left text-xs font-bold ">
             Influencer category
            </TableHead>
            <TableHead className="px-3 py-2 text-left text-xs font-bold ">
              PDF
            </TableHead>
            <TableHead className="px-3 py-2 text-left text-xs font-bold ">
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
              <TableCell className="px-3 py-2 text-sm text-[#44444A]">
                {dealer.id}
              </TableCell>
              <TableCell className="px-3 py-2 text-sm text-[#44444A]">
                {dealer.dealerName}
              </TableCell>
              <TableCell className="px-3 py-2 text-sm text-[#44444A]">
                {dealer.contact}
              </TableCell>
              <TableCell className="px-3 py-2 text-sm text-[#44444A]">
                {dealer.company}
              </TableCell>
              <TableCell className="px-3 py-2 text-sm text-[#44444A]">
                {dealer.district}
              </TableCell>
              <TableCell className="px-3 py-2 text-sm text-[#44444A]">
                {dealer.email}
              </TableCell>
              <TableCell className="px-3 py-2 text-sm text-[#44444A]">
                {dealer.referenceBy}
              </TableCell>
               <TableCell className="px-3 py-2">
                             <div className="flex l gap-2">
                              
             
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
              <TableCell className="px-3 py-2">
  <Button
    variant="ghost"
    className="flex items-center gap-2 text-[#F87B1B] font-semibold px-2 py-1 text-xs rounded-lg hover:bg-[#F87B1B1A]"
    style={{ backgroundColor: '#F87B1B1A' }}
  >
    <Eye size={14} />
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
