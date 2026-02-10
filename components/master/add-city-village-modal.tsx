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

interface CityVillageData {
  sNo: number
  cvId: string
  cityVillage: string
  district: string
  state: string
  status?: string
}

export default function AddCityVillageModal({
  trigger,
  initialData = null,
  onSave,
}: {
  trigger?: React.ReactNode
  initialData?: CityVillageData | null
  onSave?: (data: CityVillageData) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [focusedField, setFocusedField] = React.useState<string | null>(null)
  const [selectedState, setSelectedState] = React.useState(initialData?.state || "")
  const [selectedDistrict, setSelectedDistrict] = React.useState(initialData?.district || "")
  const [cityVillage, setCityVillage] = React.useState(initialData?.cityVillage || "")
  const [selectedStatus, setSelectedStatus] = React.useState(initialData?.status || "")

  const isEditMode = !!initialData

  React.useEffect(() => {
    if (initialData) {
      setSelectedState(initialData.state)
      setSelectedDistrict(initialData.district)
      setCityVillage(initialData.cityVillage)
      setSelectedStatus(initialData.status || "")
    }
  }, [initialData])

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...initialData,
        state: selectedState,
        district: selectedDistrict,
        cityVillage,
        status: selectedStatus,
      } as CityVillageData)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="max-w-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEditMode ? "Edit City/Village" : "Add City/Village"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            
            <div>
              <label className="text-xs font-semibold block mb-2 text-gray-700">
                Select District
              </label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-full border-2 !border-gray-300">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="raipur">Raipur</SelectItem>
                  <SelectItem value="bilaspur">Bilaspur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                className={`text-xs font-semibold block mb-2 transition ${
                  focusedField === "cityVillage"
                    ? "text-[#F87B1B]"
                    : "text-gray-700"
                }`}
              >
                City/Village Name
              </label>
              <Input
                placeholder="Enter city/village name"
                value={cityVillage}
                onChange={(e) => setCityVillage(e.target.value)}
                className={`w-full border-2 transition ${
                  focusedField === "cityVillage"
                    ? "!border-[#F87B1B]"
                    : "!border-gray-300"
                }`}
                onFocus={() => setFocusedField("cityVillage")}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* <div>
              <label className="text-xs font-semibold block mb-2 text-gray-700">
                Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full border-2 !border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" className="border-2" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-[#F87B1B] hover:bg-[#f87b1b]/90 text-white">
              {isEditMode ? "Update City/Village" : "Add City/Village"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
