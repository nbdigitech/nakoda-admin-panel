"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DistrictData {
  sNo: number
  districtId: string
  districtName: string
  stateName: string
  status?: string
}

export default function AddDistrictModal({
  trigger,
  initialData = null,
  onSave,
}: {
  trigger?: React.ReactNode
  initialData?: DistrictData | null
  onSave?: (data: DistrictData) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [focusedField, setFocusedField] = React.useState<string | null>(null)
  const [selectedState, setSelectedState] = React.useState(initialData?.stateName || "")
  const [districtName, setDistrictName] = React.useState(initialData?.districtName || "")
  const [selectedStatus, setSelectedStatus] = React.useState(initialData?.status || "")
  
  const isEditMode = !!initialData

  React.useEffect(() => {
    if (initialData) {
      setSelectedState(initialData.stateName)
      setDistrictName(initialData.districtName)
      setSelectedStatus(initialData.status || "")
    }
  }, [initialData])

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...initialData,
        stateName: selectedState,
        districtName,
        status: selectedStatus,
      } as DistrictData)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="max-w-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEditMode ? "Edit District" : "Add District"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-2 text-gray-700">
                Select State
              </label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full border-2 !border-gray-300">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chhattisgarh">Chhattisgarh</SelectItem>
                  <SelectItem value="madhya-pradesh">Madhya Pradesh</SelectItem>
                  <SelectItem value="maharashtra">Maharashtra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                className={`text-xs font-semibold block mb-2 transition ${
                  focusedField === "districtName"
                    ? "text-[#F87B1B]"
                    : "text-gray-700"
                }`}
              >
                District Name
              </label>
              <Input
                placeholder="Enter district name"
                value={districtName}
                onChange={(e) => setDistrictName(e.target.value)}
                className={`w-full border-2 transition ${
                  focusedField === "districtName"
                    ? "!border-[#F87B1B]"
                    : "!border-gray-300"
                }`}
                onFocus={() => setFocusedField("districtName")}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-2 text-gray-700">
                Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full border-2 !border-gray-300">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" className="border-2" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-[#F87B1B] hover:bg-[#f87b1b]/90 text-white">
              {isEditMode ? "Update District" : "Add District"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
