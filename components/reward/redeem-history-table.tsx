"use client"

import { useState } from "react"
import { Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface RedeemData {
  id: number
  subDealerName: string
  redeemPts: number
  redeemDate: string
  productClaim: string
  category: string
  status: "Completed" | "Rejected" | "Approved"
}

interface RedeemHistoryTableProps {
  onEditClick: (data: RedeemData) => void
  showEditButton?: boolean
}

const redeemData: RedeemData[] = [
  {
    id: 1,
    subDealerName: "Depok Singh",
    redeemPts: 2000,
    redeemDate: "5-Jan-25",
    productClaim: "Headphone",
    category: "Gift",
    status: "Completed",
  },
  {
    id: 2,
    subDealerName: "Abhi Shoke",
    redeemPts: 5000,
    redeemDate: "15-Jan-25",
    productClaim: "Shopping Card",
    category: "Coupon",
    status: "Rejected",
  },
  {
    id: 3,
    subDealerName: "Om Roy",
    redeemPts: 5000,
    redeemDate: "17-Jan-25",
    productClaim: "Cash-1000",
    category: "Cashback",
    status: "Completed",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700"
    case "Rejected":
      return "bg-red-100 text-red-700"
    case "Approved":
      return "bg-orange-100 text-orange-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function RedeemHistoryTable({ onEditClick, showEditButton = true }: RedeemHistoryTableProps) {
  return (
    <div className="bg-white rounded-lg p-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">S No.</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Sub Dealer Name</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Redeem Pts</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Redeem Date</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Product Claim</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Category</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
              {showEditButton && <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Action</th>}
            </tr>
          </thead>
          <tbody>
            {redeemData.map((item, index) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.subDealerName}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.redeemPts}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.redeemDate}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.productClaim}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.category}</td>
                <td className="px-4 py-3 text-sm">
                  <Badge className={`${getStatusColor(item.status)} px-3 py-1`}>
                    {item.status}
                  </Badge>
                </td>
                {showEditButton && (
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => onEditClick(item)}
                      className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        Total Order: {redeemData.length}
      </div>
    </div>
  )
}
