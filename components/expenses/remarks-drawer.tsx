"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { doc, updateDoc } from "firebase/firestore";
import { getFirestoreDB } from "@/firebase";

interface Expense {
  id: string;
  category: string;
  amount: number;
  image?: string;
  status?: string;
  remarks?: string;
}

interface RemarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onRefresh: () => void;
}

export function RemarksDrawer({
  isOpen,
  onClose,
  expense,
  onRefresh,
}: RemarksDrawerProps) {
  const [remarkText, setRemarkText] = useState("");
  const [remarkStatus, setRemarkStatus] = useState("pending");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (expense) {
      setRemarkText(expense.remarks || "");
      setRemarkStatus(expense.status || "pending");
    }
  }, [expense]);

  const handleUpdate = async () => {
    if (!expense?.id) return;

    try {
      setIsUpdating(true);
      const db = getFirestoreDB();
      const expenseRef = doc(db, "expenses", expense.id);

      await updateDoc(expenseRef, {
        status: remarkStatus,
        remarks: remarkText,
      });

      toast.success("Expense status updated successfully");
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Error updating expense status:", error);
      toast.error("Failed to update expense status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-[#F87B1B] text-white p-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Expense Remark</h3>
        <button
          onClick={onClose}
          className="text-white hover:opacity-80 transition-opacity"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Category */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Category
          </label>
          <p className="text-gray-800 font-medium">{expense?.category}</p>
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Amount
          </label>
          <input
            type="text"
            value={`₹ ${expense?.amount}`}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 focus:outline-none"
          />
        </div>

        {/* Remark Text Area */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Remark
          </label>
          <textarea
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F87B1B] resize-none transition-all"
            rows={5}
            placeholder="Add remarks here..."
          />
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Status
          </label>
          <select
            value={remarkStatus}
            onChange={(e) => setRemarkStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F87B1B] bg-white cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Footer - Update Button */}
      <div className="border-t p-6 bg-gray-50">
        <Button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="w-full bg-[#F87B1B] hover:bg-[#E86A0A] text-white font-semibold py-6 flex items-center justify-center gap-2 transition-colors"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update"
          )}
        </Button>
      </div>
    </div>
  );
}
