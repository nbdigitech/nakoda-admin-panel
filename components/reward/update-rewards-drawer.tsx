"use client"

import { useState, useEffect } from "react"
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface RedeemData {
  id: number
  subDealerName: string
  redeemPts: number
  redeemDate: string
  productClaim: string
  category: string
  status: "Completed" | "Rejected" | "Approved"
}

interface UpdateRewardsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedData?: RedeemData | null
}

export default function UpdateRewardsDrawer({
  open,
  onOpenChange,
  selectedData,
}: UpdateRewardsDrawerProps) {
  const [formData, setFormData] = useState({
    subDealerName: "",
    productClaim: "",
    redeemPts: "",
    redeemDate: "",
    category: "Gift",
    status: "Approved",
  })

  useEffect(() => {
    if (selectedData) {
      setFormData({
        subDealerName: selectedData.subDealerName,
        productClaim: selectedData.productClaim,
        redeemPts: selectedData.redeemPts.toString(),
        redeemDate: selectedData.redeemDate,
        category: selectedData.category,
        status: selectedData.status,
      })
    }
  }, [selectedData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Add your API call here
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className=" right-0 left-auto rounded-l-2xl ">
        <div className="flex flex-col h-full ">
          <div className="bg-[#F87B1B] text-white px-6 py-4">
            <h2 className="text-lg font-bold">Update Rewards</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-[#929292]">
          {/* Sub Dealer Name */}
          <div>
            <label className="text-sm font-medium  block mb-2">
              Sub Dealer Name
            </label>
            <input
              type="text"
              name="subDealerName"
              value={formData.subDealerName}
              onChange={handleChange}
              placeholder="Depok Singh"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F87B1B] focus:ring-2 focus:ring-[#F87B1B] focus:ring-opacity-50"
            />
          </div>

          {/* Product Claim */}
          <div>
            <label className="text-sm font-medium  block mb-2">
              Product Claim
            </label>
            <input
              type="text"
              name="productClaim"
              value={formData.productClaim}
              onChange={handleChange}
              placeholder="Headphones"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F87B1B] focus:ring-2 focus:ring-[#F87B1B] focus:ring-opacity-50"
            />
          </div>

          {/* Redeem Pts */}
          <div>
            <label className="text-sm font-medium  block mb-2">
              Redeem Pts
            </label>
            <input
              type="number"
              name="redeemPts"
              value={formData.redeemPts}
              onChange={handleChange}
              placeholder="2000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F87B1B] focus:ring-2 focus:ring-[#F87B1B] focus:ring-opacity-50"
            />
          </div>

          {/* Redeem Date */}
          <div>
            <label className="text-sm font-medium  block mb-2">
              Redeem Date
            </label>
            <input
              type="text"
              name="redeemDate"
              value={formData.redeemDate}
              onChange={handleChange}
              placeholder="05-Jan-25"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F87B1B] focus:ring-2 focus:ring-[#F87B1B] focus:ring-opacity-50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium  block mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F87B1B] focus:ring-2 focus:ring-[#F87B1B] focus:ring-opacity-50"
            >
              <option>Gift</option>
              <option>Voucher</option>
              <option>Cashback</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium  block mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F87B1B] focus:ring-2 focus:ring-[#F87B1B] focus:ring-opacity-50"
            >
              <option>Approved</option>
              <option>Rejected</option>
              <option>Completed</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors mt-6 mb-6"
          >
            Submit
          </button>
        </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
