"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { getFirestoreDB } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface UpdateRateDrawerProps {
  trigger?: React.ReactNode;
  currentRate?: number;
}

export default function UpdateRateDrawer({
  trigger = (
    <button className="text-[#F87B1B] hover:text-[#F87B1B] font-bold">
      Update Rate
    </button>
  ),
  currentRate = 0,
}: UpdateRateDrawerProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [updateRate, setUpdateRate] = useState("");
  const [status, setStatus] = useState("Active");
  const [open, setOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  // Reset states when opened
  useEffect(() => {
    if (open) {
      setDate(new Date());
      setUpdateRate("");
    }
  }, [open]);

  const newPriceValue = Number(updateRate) || 0;
  const difference = newPriceValue ? newPriceValue - currentRate : 0;
  const isUp = difference >= 0;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    setDatePopoverOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!updateRate || isNaN(Number(updateRate))) {
      toast({
        title: "Invalid Rate",
        description: "Please enter a valid numeric rate.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const db = getFirestoreDB();

      const payload = {
        oldPrice: currentRate,
        newPrice: Number(updateRate),
        difference: difference,
        date: date?.toISOString() || new Date().toISOString(),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "daily_price"), payload);

      toast({
        title: "Success",
        description: "Rate updated successfully!",
      });

      setOpen(false);
    } catch (error) {
      console.error("Error updating rate:", error);
      toast({
        title: "Error",
        description: "Failed to update rate.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-[426px] p-0 flex flex-col [&>button]:hidden">
        {/* Orange Header */}
        <div className="bg-[#F87B1B] text-white px-6 py-4">
          <h2 className="text-lg font-bold">Update Rate</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 px-6 py-6 flex-1 overflow-y-auto"
        >
          {/* Old Rate (Disabled) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Previous Rate
            </label>
            <input
              type="text"
              value={currentRate ? currentRate.toLocaleString() : "0"}
              disabled
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 font-medium cursor-not-allowed"
            />
          </div>

          {/* Date with Calendar Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:border-[#F87B1B] flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span>
                    {date ? format(date, "dd MMM yyyy") : "Pick a date"}
                  </span>
                  <CalendarIcon className="w-5 h-5 text-[#F87B1B]" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* New Update Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Rate
            </label>
            <input
              type="number"
              value={updateRate}
              onChange={(e) => setUpdateRate(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:border-[#F87B1B] transition-colors"
              placeholder="Enter new rate"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#F87B1B] appearance-none cursor-pointer bg-white text-[#F87B1B] font-semibold transition-colors"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          {/* Spacer */}
          <div className="h-8" />

          {/* Difference Amount */}
          {updateRate && (
            <div className="text-center py-6">
              <p
                className={`text-lg font-semibold ${isUp ? "text-green-600" : "text-red-500"}`}
              >
                ₹ {Math.abs(difference)} {isUp ? "▲" : "▼"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Difference</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F87B1B] hover:bg-[#e86a0a] text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Update Rate"
            )}
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
