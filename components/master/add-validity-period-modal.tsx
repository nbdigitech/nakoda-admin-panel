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

import { addValidityPeriod } from "@/services/masterData";

interface ValidityPeriodData {
  id: string;
  validityPeriod: number | string;
  status?: string;
}

export default function AddValidityPeriodModal({
  trigger,
  initialData = null,
  onSave,
}: {
  trigger?: React.ReactNode;
  initialData?: ValidityPeriodData | null;
  onSave?: (data?: ValidityPeriodData) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [focusedField, setFocusedField] = React.useState<string | null>(null);
  const [validityPeriod, setValidityPeriod] = React.useState(
    initialData?.validityPeriod || "",
  );
  const [selectedStatus, setSelectedStatus] = React.useState(
    initialData?.status || "active",
  );
  const [loading, setLoading] = React.useState(false);

  const isEditMode = !!initialData;

  React.useEffect(() => {
    if (initialData) {
      setValidityPeriod(initialData.validityPeriod);
      setSelectedStatus(initialData.status || "active");
    } else {
      setValidityPeriod("");
      setSelectedStatus("active");
    }
  }, [initialData, open]);

  const handleSave = async () => {
    try {
      if (!validityPeriod) return;

      setLoading(true);
      const payload = {
        id: initialData?.id || "",
        validityPeriod: validityPeriod,
        status: selectedStatus,
      };

      await addValidityPeriod(payload);

      if (onSave) {
        onSave(payload);
      }
      setOpen(false);
    } catch (error) {
      console.error("Failed to save validity period:", error);
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
            {isEditMode ? "Edit Validity Period" : "Add Validity Period"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <label
                className={`text-xs font-semibold block mb-2 transition ${
                  focusedField === "validityPeriod"
                    ? "text-[#F87B1B]"
                    : "text-gray-700"
                }`}
              >
                Validity Period (Number of Days)
              </label>
              <Input
                type="number"
                placeholder="Enter number (e.g. 30)"
                value={validityPeriod}
                onChange={(e) => setValidityPeriod(e.target.value)}
                className={`w-full border-2 transition ${
                  focusedField === "validityPeriod"
                    ? "!border-[#F87B1B]"
                    : "!border-gray-300"
                }`}
                onFocus={() => setFocusedField("validityPeriod")}
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
              disabled={loading}
              className="bg-[#F87B1B] hover:bg-[#f87b1b]/90 text-white"
            >
              {loading ? "Saving..." : isEditMode ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
