"use client"

import Image from "next/image"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Eye } from "lucide-react"


interface Dealer {
  id: number
  dealerName: string
  contact: string
  company: string
  district: string
  email: string
  referenceBy: string
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
    pancard: true,
    gst: true,
  },
]

export default function DealerTable() {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        {/* Header */}
        <TableHeader>
          <TableRow>
            <TableHead className="px-3 py-2 font-bold text-xs">S No.</TableHead>
            <TableHead className="px-3 py-2 font-bold text-xs">Dealer Name</TableHead>
            <TableHead className="px-3 py-2 font-bold text-xs">Contact</TableHead>
            <TableHead className="px-3 py-2 font-bold text-xs">Company</TableHead>
            <TableHead className="px-3 py-2 font-bold text-xs">District</TableHead>
            <TableHead className="px-3 py-2 font-bold text-xs">E-Mail</TableHead>
            <TableHead className="px-3 py-2 font-bold text-xs">Reference By</TableHead>
            <TableHead className="px-3 py-2 font-bold text-xs">PDF</TableHead>
            <TableHead className="px-3 py-2 font-bold text-xs">Action</TableHead>
          </TableRow>
        </TableHeader>

        {/* Body */}
        <TableBody>
          {dealers.map((dealer) => (
            <TableRow key={dealer.id} className="hover:bg-gray-50">
              <TableCell className="px-3 py-4 text-md">{dealer.id}</TableCell>
              <TableCell className="px-3 py-4 text-md">{dealer.dealerName}</TableCell>
              <TableCell className="px-3 py-4 text-md">{dealer.contact}</TableCell>
              <TableCell className="px-3 py-4 text-md">{dealer.company}</TableCell>
              <TableCell className="px-3 py-4 text-md">{dealer.district}</TableCell>
              <TableCell className="px-3 py-4 text-md">{dealer.email}</TableCell>
              <TableCell className="px-3 py-4 text-md">{dealer.referenceBy}</TableCell>

              {/* PDF Column */}
              <TableCell className="px-3 py-2">
                <div className="flex l gap-2">
                  {dealer.gst && (
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                      <Image
                        src="/pdf icon.png"
                        alt="GST PDF"
                        width={22}
                        height={22}
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        GST 
                      </span>
                    </div>
                  )}

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

              {/* Action */}
             <TableCell className="px-3 py-2">
  <Button
    variant="ghost"
    className="flex items-center gap-2 text-[#F87B1B] font-semibold px-2 py-1 text-xs rounded-lg hover:bg-[#F87B1B1A]"
    style={{ backgroundColor: '#F87B1B1A' }}
  >
    <Edit className="w-3 h-3" />
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
