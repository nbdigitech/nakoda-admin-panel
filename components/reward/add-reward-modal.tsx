"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { addReward, updateReward } from "@/services/rewards";
import { useToast } from "@/hooks/use-toast";

interface AddRewardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any | null;
  onSuccess?: () => void;
}

export default function AddRewardModal({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: AddRewardModalProps) {
  const [formData, setFormData] = useState<any>({
    imagePath: "",
    requiredPoints: "",
    title: "",
    category: "Gift",
    expiryDate: "",
    status: "active",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatForInput = (date: any) => {
    if (!date) return "";
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        imagePath: initialData.imagePath || "",
        requiredPoints: initialData.requiredPoints || "",
        title: initialData.title || "",
        category: initialData.category || "Gift",
        expiryDate: formatForInput(initialData.expiryDate),
        status: initialData.status || "active",
        description: initialData.description || "",
      });
    } else {
      setFormData({
        imagePath: "",
        requiredPoints: "",
        title: "",
        category: "Gift",
        expiryDate: "",
        status: "active",
        description: "",
      });
    }
  }, [initialData, open]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({
          ...prev,
          imagePath: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.requiredPoints) {
      toast({
        title: "Validation Error",
        description: "Title and Required Points are mandatory",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      if (initialData) {
        await updateReward(initialData.id, formData);
        toast({ title: "Success", description: "Reward updated successfully" });
      } else {
        await addReward(formData);
        toast({ title: "Success", description: "Reward added successfully" });
      }

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving reward:", error);
      toast({
        title: "Error",
        description: "Failed to save reward",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mb-3 mt-1 sm:max-w-[650px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <DialogHeader className="bg-[#F87B1B] text-white p-4 space-y-1">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">
            {initialData ? "Update Reward" : "Create New Reward"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="p-8 py-12 space-y-8 bg-white max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Preview & Upload */}
            <div className="col-span-full">
              <label className="text-sm font-bold  uppercase tracking-wider mb-2 block">
                Reward Image
              </label>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50">
                  {formData.imagePath ? (
                    <img
                      src={formData.imagePath}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="reward-image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="reward-image"
                    className="cursor-pointer inline-flex items-center px-6 py-2 text-sm bg-orange-50 text-[#F87B1B] font-bold rounded-lg border-2 border-[#F87B1B1A] hover:bg-orange-100 transition-colors"
                  >
                    Choose Image
                  </label>
                  <p className="text-[12px]  mt-2 italic">
                    Recommended size: 500x500px. Max size: 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-bold uppercase tracking-wider mb-2 block">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter title"
                className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F87B1B] transition-colors"
              />
            </div>

            {/* Required Points */}
            <div>
              <label className="text-sm font-bold  uppercase tracking-wider mb-2 block">
                Required Points
              </label>
              <input
                type="number"
                name="requiredPoints"
                value={formData.requiredPoints}
                onChange={handleChange}
                placeholder="2000"
                className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F87B1B] transition-colors font-bold"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-bold  uppercase tracking-wider mb-2 block">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F87B1B] transition-colors"
              >
                <option value="Gift">Gift</option>
                <option value="Voucher">Voucher</option>
                <option value="Cashback">Cashback</option>
              </select>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="text-sm font-bold  uppercase tracking-wider mb-2 block">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F87B1B] transition-colors"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-bold  uppercase tracking-wider mb-2 block">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F87B1B] transition-colors"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="text-sm font-bold  uppercase tracking-wider mb-2 block">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Specify details about this reward item..."
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#F87B1B] transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              onClick={() => onOpenChange(false)}
              className="font-bold  hover:text-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#F87B1B] hover:bg-orange-600 text-white font-bold px-8 rounded-xl shadow-lg shadow-orange-100 min-w-[120px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : initialData ? (
                "Update Reward"
              ) : (
                "Add Reward"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
