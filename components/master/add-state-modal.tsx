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

interface StateData {
  sNo: number
  stateId: string
  stateName: string
  status?: string
}

export default function AddStateModal({
  trigger,
  initialData = null,
  onSave,
}: {
  trigger?: React.ReactNode
  initialData?: StateData | null
  onSave?: (data: StateData) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [focusedField, setFocusedField] = React.useState<string | null>(null)
  const [stateName, setStateName] = React.useState(initialData?.stateName || "")
  const [selectedStatus, setSelectedStatus] = React.useState(initialData?.status || "")
  
  const isEditMode = !!initialData

  React.useEffect(() => {
    if (initialData) {
      setStateName(initialData.stateName)
      setSelectedStatus(initialData.status || "")
    }
  }, [initialData])

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...initialData,
        stateName,
        status: selectedStatus,
      } as StateData)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="max-w-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEditMode ? "Edit State" : "Add State"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <label
                className={`text-xs font-semibold block mb-2 transition ${
                  focusedField === "stateName"
                    ? "text-[#F87B1B]"
                    : "text-gray-700"
                }`}
              >
                State Name
              </label>
              <Input
                placeholder="Enter state name"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className={`w-full border-2 transition ${
                  focusedField === "stateName"
                    ? "!border-[#F87B1B]"
                    : "!border-gray-300"
                }`}
                onFocus={() => setFocusedField("stateName")}
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
              {isEditMode ? "Update State" : "Add State"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
