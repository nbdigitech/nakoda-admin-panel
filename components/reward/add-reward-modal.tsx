"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface AddRewardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddRewardModal({ open, onOpenChange }: AddRewardModalProps) {
  const [formData, setFormData] = useState({
    image: "",
    points: "",
    title: "",
    category: "Gift",
    expiryDate: "",
    status: "Active",
    description: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({
        ...prev,
        image: e.target.files![0].name,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Add your API call here
    onOpenChange(false)
    setFormData({
      image: "",
      points: "",
      title: "",
      category: "Gift",
      expiryDate: "",
      status: "Active",
      description: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
<DialogContent className="max-w-6xl w-full [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add Reward</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-[#929292]">
          {/* Form Grid */}
<div className="grid grid-cols-2 gap-6">

            {/* Upload Image */}
            <div>
              <label className="text-sm text-gray-500">Upload Image</label>
              <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2">
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  className="text-sm"
                />
               
              </div>
            </div>

            {/* Required Points */}
            <div>
              <label className="text-sm text-gray-500">Required Points</label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleChange}
                placeholder="2000"
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F87B1B] focus:ring-1 focus:ring-[#F87B1B] focus:ring-opacity-50"
              />
            </div>

            {/* Title */}
            <div>
              <label className="text-sm text-gray-500">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Sony Headphones"
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F87B1B] focus:ring-1 focus:ring-[#F87B1B] focus:ring-opacity-50"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm text-gray-500">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F87B1B] focus:ring-1 focus:ring-[#F87B1B] focus:ring-opacity-50"
              >
                <option>Gift</option>
                <option>Voucher</option>
                <option>Cashback</option>
              </select>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="text-sm text-gray-500">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F87B1B] focus:ring-1 focus:ring-[#F87B1B] focus:ring-opacity-50"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F87B1B] focus:ring-1 focus:ring-[#F87B1B] focus:ring-opacity-50"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-500">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Specify The Number Of Points A User Must Have To Claim This Reward."
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#F87B1B] focus:ring-1 focus:ring-[#F87B1B] focus:ring-opacity-50"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-center gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#F87B1B] hover:bg-orange-400">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}