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

import { addCity } from "@/services/masterData";
import { useMasterData } from "@/context/MasterDataContext";

interface CityVillageData {
  id: string;
  cityName: string;
  districtId: string;
  // stateName: string; // Removed as part of request
  status?: string;
}

export default function AddCityVillageModal({
  trigger,
  initialData = null,
  onSave,
}: {
  trigger?: React.ReactNode;
  initialData?: CityVillageData | null;
  onSave?: (data?: CityVillageData) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [focusedField, setFocusedField] = React.useState<string | null>(null);
  // const [selectedState, setSelectedState] = React.useState(
  //   initialData?.stateName || "",
  // ); // Removed
  const [selectedDistrict, setSelectedDistrict] = React.useState(
    initialData?.districtId || "",
  );
  const [cityName, setCityName] = React.useState(initialData?.cityName || "");
  const [selectedStatus, setSelectedStatus] = React.useState(
    initialData?.status || "active",
  );
  const { districts } = useMasterData(); // Removed states
  const [loading, setLoading] = React.useState(false);

  const isEditMode = !!initialData;

  React.useEffect(() => {
    if (initialData) {
      // setSelectedState(initialData.stateName); // Removed
      setSelectedDistrict(initialData.districtId);
      setCityName(initialData.cityName);
      setSelectedStatus(initialData.status || "active");
    } else {
      // setSelectedState(""); // Removed
      setSelectedDistrict("");
      setCityName("");
      setSelectedStatus("active");
    }
  }, [initialData, open]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload: any = {
        id: initialData?.id || "",
        districtId: selectedDistrict,
        cityName,
        status: selectedStatus,
      };

      if (!isEditMode) {
        await addCity(payload);
      }

      if (onSave) {
        onSave(payload);
      }
      setOpen(false);
    } catch (error) {
      console.error("Failed to save city:", error);
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
            {isEditMode ? "Edit City/Village" : "Add City/Village"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            {/* State selection removed */}

            <div>
              <label className="text-xs font-semibold block mb-2 text-gray-700">
                Select District
              </label>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
              >
                <SelectTrigger className="w-full border-2 !border-gray-300">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {districts
                    // .filter((d) => !selectedState || d.stateName === selectedState) // Removed filter
                    .map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.districtName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                className={`text-xs font-semibold block mb-2 transition ${
                  focusedField === "cityName"
                    ? "text-[#F87B1B]"
                    : "text-gray-700"
                }`}
              >
                City/Village Name
              </label>
              <Input
                placeholder="Enter city/village name"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                className={`w-full border-2 transition ${
                  focusedField === "cityName"
                    ? "!border-[#F87B1B]"
                    : "!border-gray-300"
                }`}
                onFocus={() => setFocusedField("cityName")}
                onBlur={() => setFocusedField(null)}
              />
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
              {isEditMode ? "Update City/Village" : "Add City/Village"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
