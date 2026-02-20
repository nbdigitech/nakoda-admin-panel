"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { addDesignation } from "@/services/masterData";

interface StaffCategoryData {
  id: string;
  staffCategoryName: string;
  status?: string;
}

export default function AddStaffCategoryModal({
  trigger,
  initialData = null,
  onSave,
}: {
  trigger?: React.ReactNode;
  initialData?: StaffCategoryData | null;
  onSave?: (data?: StaffCategoryData) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [focusedField, setFocusedField] = React.useState<string | null>(null);
  const [staffCategoryName, setStaffCategoryName] = React.useState(
    initialData?.staffCategoryName || "",
  );
  const [selectedStatus, setSelectedStatus] = React.useState(
    initialData?.status || "active",
  );
  const [loading, setLoading] = React.useState(false);

  const isEditMode = !!initialData;

  React.useEffect(() => {
    if (initialData) {
      setStaffCategoryName(initialData.staffCategoryName);
      setSelectedStatus(initialData.status || "active");
    } else {
      setStaffCategoryName("");
      setSelectedStatus("active");
    }
  }, [initialData, open]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        id: initialData?.id || "",
        staffCategoryName,
        status: selectedStatus,
      };

      if (!isEditMode) {
        await addDesignation(payload);
      }

      if (onSave) {
        onSave(payload);
      }
      setOpen(false);
    } catch (error) {
      console.error("Failed to save designation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="max-w-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEditMode ? "Edit Staff Category" : "Add Staff Category"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <label
                className={`text-xs font-semibold block mb-2 transition ${
                  focusedField === "designationName"
                    ? "text-[#F87B1B]"
                    : "text-gray-700"
                }`}
              >
                Designation Name
              </label>
              <Input
                placeholder="Enter designation name"
                value={staffCategoryName}
                onChange={(e) => setStaffCategoryName(e.target.value)}
                className={`w-full border-2 transition ${
                  focusedField === "staffCategoryName"
                    ? "!border-[#F87B1B]"
                    : "!border-gray-300"
                }`}
                onFocus={() => setFocusedField("designationName")}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            <div>
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
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              className="border-2"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#F87B1B] hover:bg-[#f87b1b]/90 text-white"
            >
              {isEditMode ? "Update Category" : "Add Category"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
