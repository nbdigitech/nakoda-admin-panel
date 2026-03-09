"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import AddBannerImageModal from "./add-banner-image-modal";
import { useMasterData } from "@/context/MasterDataContext";
import { deleteBannerImage } from "@/services/masterData";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function BannerImageCard() {
  const { banners, refreshBanners, loading } = useMasterData();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleDeleteBanner = async (docId: string) => {
    if (confirm("Are you sure you want to delete this banner image?")) {
      try {
        await deleteBannerImage({ docId });
        refreshBanners();
        toast.success("Banner deleted successfully");
      } catch (error) {
        console.error("Failed to delete banner:", error);
        toast.error("Failed to delete banner");
      }
    }
  };

  const handleOpenViewer = (index: number) => {
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Banner Images</CardTitle>
        <AddBannerImageModal
          onSave={refreshBanners}
          trigger={
            <Button className="bg-green-100 text-green-700 hover:bg-green-200 h-8 text-xs">
              + Add Banner
            </Button>
          }
        />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                <TableHead className="w-12 font-semibold text-gray-700">
                  S No.
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Image
                </TableHead>
                <TableHead className="w-24 font-semibold text-gray-700">
                  Status
                </TableHead>
                <TableHead className="w-24 font-semibold text-gray-700 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No banner images found
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner, index) => (
                  <TableRow
                    key={banner.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <TableCell className="text-gray-700">{index + 1}</TableCell>
                    <TableCell>
                      <div
                        className="relative w-20 h-12 cursor-pointer border rounded bg-gray-100 overflow-hidden"
                        onClick={() => handleOpenViewer(index)}
                      >
                        <Image
                          src={banner.imagePath}
                          alt={`Banner ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            banner.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        ></span>
                        {banner.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <AddBannerImageModal
                          initialData={banner}
                          onSave={refreshBanners}
                          trigger={
                            <button className="text-orange-500 hover:text-orange-600">
                              <Edit className="w-4 h-4" />
                            </button>
                          }
                        />
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Image Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-transparent border-none">
          <DialogTitle className="sr-only">Banner Image Viewer</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center p-6 bg-black/80 rounded-lg">
            <button
              onClick={() => setViewerOpen(false)}
              className="absolute top-4 right-4 z-50 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>

            {banners.length > 0 && (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="relative w-full aspect-video md:aspect-[21/9] max-h-[70vh]">
                  <Image
                    src={banners[currentIndex].imagePath}
                    alt={`Banner ${currentIndex + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 left-4">
                  <button
                    onClick={goToPrevious}
                    className="p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-4">
                  <button
                    onClick={goToNext}
                    className="p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </div>
                <div className="mt-4 text-white font-medium text-lg">
                  {currentIndex + 1} / {banners.length}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
