"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Power, ChevronLeft, ChevronRight, X } from "lucide-react";
import { getUsers, changeUserStatus } from "@/services/user";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Dealer {
  id: string;
  name: string;
  phoneNumber: string;
  organizationName: string;
  districtId: string;
  email: string;
  asmId: string;
  gstUrl: string;
  pancardUrl: string;
  aadhaarPath: string;
  status: string;
  role: string;
  imagePath?: string;
  permissions?: string[];
}

export default function DealerTable({
  statusFilter = "active",
  searchTerm = "",
}: {
  statusFilter?: string;
  searchTerm?: string;
}) {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Image Slider State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<
    { url: string; label: string }[]
  >([]);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);

  const openViewer = (
    docs: { url: string; label: string }[],
    index: number,
  ) => {
    setSelectedDocs(docs);
    setCurrentDocIndex(index);
    setViewerOpen(true);
  };

  const nextDoc = () => {
    setCurrentDocIndex((prev) => (prev + 1) % selectedDocs.length);
  };

  const prevDoc = () => {
    setCurrentDocIndex(
      (prev) => (prev - 1 + selectedDocs.length) % selectedDocs.length,
    );
  };

  const fetchDealers = async () => {
    setLoading(true);
    try {
      const payload: any =
        statusFilter !== "all" ? { role: "dealer", status: statusFilter } : {};
      const res = await getUsers(payload);
      if (res?.data) {
        let dealersData = res.data;
        if (statusFilter === "all") {
          dealersData = dealersData.filter((u: any) => u.role === "dealer");
        }
        setDealers(dealersData);
        setCurrentPage(1); // Reset to first page on new fetch
      } else {
        setDealers([]);
      }
    } catch (error) {
      console.error("Failed to fetch dealers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, [statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    if (
      confirm(
        `Are you sure you want to ${newStatus === "active" ? "activate" : "deactivate"} this dealer?`,
      )
    ) {
      try {
        await changeUserStatus({ id: id, status: newStatus });
        fetchDealers();
      } catch (error) {
        console.error("Failed to update status:", error);
      }
    }
  };

  const filteredDealers = dealers.filter((dealer) =>
    dealer.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredDealers.length / itemsPerPage);
  const paginatedDealers = filteredDealers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table>
          {/* Header */}
          <TableHeader>
            <TableRow>
              <TableHead className="px-3 py-2 font-bold text-xs">
                S No.
              </TableHead>
              <TableHead className="px-3 py-2 font-bold text-xs">
                Dealer Name
              </TableHead>
              <TableHead className="px-3 py-2 font-bold text-xs">
                Contact
              </TableHead>
              <TableHead className="px-3 py-2 font-bold text-xs">
                Company
              </TableHead>
              <TableHead className="px-3 py-2 font-bold text-xs">
                District
              </TableHead>
              <TableHead className="px-3 py-2 font-bold text-xs">
                E-Mail
              </TableHead>
              <TableHead className="px-3 py-2 font-bold text-xs">
                ASM ID
              </TableHead>

              <TableHead className="px-3 py-2 font-bold text-xs">
                Documents
              </TableHead>
              <TableHead className="px-3 py-2 font-bold text-xs">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedDealers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No dealers found
                </TableCell>
              </TableRow>
            ) : (
              paginatedDealers.map((dealer, index) => (
                <TableRow key={dealer.id} className="hover:bg-gray-50">
                  <TableCell className="px-3 py-4 text-md">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md">
                    {dealer.name}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md">
                    {dealer.phoneNumber}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md">
                    {dealer.organizationName}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md">
                    {dealer.districtId?.substring(0, 8) || "-"}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md text-gray-500">
                    {dealer.email}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md">
                    {dealer.asmId?.substring(0, 8) || "-"}
                  </TableCell>

                  {/* Documents Column */}
                  <TableCell className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      {/* Thumbnail trigger */}
                      <div
                        className="relative cursor-pointer"
                        onClick={() => {
                          const isPdf = (url: string) =>
                            url?.toLowerCase().includes(".pdf");
                          const sliderDocs: { url: string; label: string }[] =
                            [];

                          // If main image is PDF, open in browser
                          if (dealer.imagePath && isPdf(dealer.imagePath)) {
                            window.open(dealer.imagePath, "_blank");
                            return;
                          }

                          if (dealer.imagePath)
                            sliderDocs.push({
                              url: dealer.imagePath,
                              label: "Profile Image",
                            });

                          // Only add non-PDF Aadhaar to slider
                          if (
                            dealer.aadhaarPath &&
                            !isPdf(dealer.aadhaarPath)
                          ) {
                            sliderDocs.push({
                              url: dealer.aadhaarPath,
                              label: "Aadhaar",
                            });
                          }

                          if (sliderDocs.length > 0) {
                            openViewer(sliderDocs, 0);
                          }
                        }}
                      >
                        {dealer.imagePath ? (
                          <img
                            src={dealer.imagePath}
                            alt="avatar"
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 hover:border-orange-400 transition-colors shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                            <Eye className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          {dealer.gstUrl && (
                            <Link
                              href={dealer.gstUrl}
                              target="_blank"
                              className="text-[10px] bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded font-medium hover:bg-gray-200"
                            >
                              GST
                            </Link>
                          )}
                          {dealer.pancardUrl && (
                            <Link
                              href={dealer.pancardUrl}
                              target="_blank"
                              className="text-[10px] bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded font-medium hover:bg-gray-200"
                            >
                              PAN
                            </Link>
                          )}
                        </div>
                        {dealer.aadhaarPath &&
                          (dealer.aadhaarPath.toLowerCase().includes(".pdf") ? (
                            <Link
                              href={dealer.aadhaarPath}
                              target="_blank"
                              className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-bold hover:bg-orange-100 border border-orange-100 w-fit"
                            >
                              Aadhaar (PDF)
                            </Link>
                          ) : (
                            <span className="text-[10px] text-gray-500 font-medium">
                              + Aadhaar
                            </span>
                          ))}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-3 py-4 text-md">
                    <div className="flex flex-col items-center gap-1">
                      <Switch
                        checked={dealer.status === "active"}
                        onCheckedChange={() =>
                          handleStatusChange(dealer.id, dealer.status)
                        }
                        className={`${dealer.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span
                        className={`text-xs font-semibold ${dealer.status === "active" ? "text-green-600" : "text-red-600"}`}
                      >
                        {dealer.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 py-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="text-[#F87B1B] border-[#F87B1B] hover:bg-[#F87B1B1A]"
        >
          Previous
        </Button>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={
                currentPage === page
                  ? "bg-[#F87B1B] text-white hover:bg-[#e66a15]"
                  : "text-[#F87B1B] border-[#F87B1B] hover:bg-[#F87B1B1A]"
              }
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="text-[#F87B1B] border-[#F87B1B] hover:bg-[#F87B1B1A]"
        >
          Next
        </Button>
      </div>
      {/* Document Viewer Modal */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black/95 border-none">
          <DialogTitle className="sr-only">Document View</DialogTitle>
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {selectedDocs[currentDocIndex] && (
              <>
                <img
                  src={selectedDocs[currentDocIndex].url}
                  alt={selectedDocs[currentDocIndex].label}
                  className="max-w-full max-h-full object-contain"
                />

                <div className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                  {selectedDocs[currentDocIndex].label}
                </div>
              </>
            )}

            {selectedDocs.length > 1 && (
              <>
                <button
                  onClick={prevDoc}
                  className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
                >
                  <ChevronLeft size={32} />
                </button>

                <button
                  onClick={nextDoc}
                  className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
                >
                  <ChevronRight size={32} />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-sm text-white">
                  {currentDocIndex + 1} / {selectedDocs.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
