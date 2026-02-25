"use client";

import { useEffect, useState } from "react";
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
import {
  Eye,
  Power,
  ChevronLeft,
  ChevronRight,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import { getUsers, changeUserStatus } from "@/services/user";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSubDealers, deleteSubDealer } from "@/services/sub-dealer";
import EditSubDealerModal from "./edit-sub-dealer-modal";

interface SubDealer {
  id: string;
  name: string;
  phoneNumber: string;
  districtId: string;
  categoryName: string;
  influencerCategory: string;
  gstUrl: string;
  pancardUrl: string;
  aadhaarPath: string;
  status: string;
  role: string;
  imagePath?: string;
  distributorName: string;
  address: string;
  createdAt: Date;
}

export default function SubDealerTable({
  activeTab = "All",
  statusFilter = "active",
  searchTerm = "",
}: {
  activeTab?: string;
  statusFilter?: string;
  searchTerm?: string;
}) {
  const [subDealers, setSubDealers] = useState<SubDealer[]>([]);
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

  const fetchSubDealers = async () => {
    const applyFiltersAndSort = (rawData: any[]) => {
      let subDealersData = rawData.filter((u: any) => u.role === "influencer");

      if (statusFilter !== "all") {
        subDealersData = subDealersData.filter(
          (u: any) => u.status?.toLowerCase() === statusFilter.toLowerCase(),
        );
      }

      const parseDate = (d: any) => {
        if (!d) return 0;
        if (d._seconds) return d._seconds * 1000;
        if (d.seconds) return d.seconds * 1000;
        if (d instanceof Date) return d.getTime();
        if (typeof d === "string" || typeof d === "number")
          return new Date(d).getTime();
        if (typeof d.toDate === "function") return d.toDate().getTime();
        return 0;
      };

      if (activeTab === "Today") {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        subDealersData = subDealersData.filter((u: any) => {
          const dTime = parseDate(u.createdAt);
          return (
            dTime >= startOfToday.getTime() && dTime <= endOfToday.getTime()
          );
        });
      }

      subDealersData.sort((a: any, b: any) => {
        return parseDate(b.createdAt) - parseDate(a.createdAt);
      });

      return subDealersData;
    };

    try {
      // 1. Instantly pull from generic 'allUsers' cache
      const cachedUsers = sessionStorage.getItem("allUsers");
      if (cachedUsers) {
        setSubDealers(applyFiltersAndSort(JSON.parse(cachedUsers)));
        setLoading(false); // Make it feel instant
      } else {
        setLoading(true); // Visual indicator only if no cache exists
      }

      // 2. Background fetch latest global users
      const fallbackRes = await getSubDealers();
      let allUsers = fallbackRes || [];

      if (allUsers.length > 0) {
        // 3. Keep cache up-to-date
        sessionStorage.setItem("allUsers", JSON.stringify(allUsers));
        setSubDealers(applyFiltersAndSort(allUsers));
        setCurrentPage(1);
      } else {
        if (!cachedUsers) setSubDealers([]);
      }
    } catch (error) {
      console.error("Failed to fetch sub-dealers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubDealers();
  }, [statusFilter, activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    if (
      confirm(
        `Are you sure you want to ${newStatus === "active" ? "activate" : "deactivate"} this sub-dealer?`,
      )
    ) {
      try {
        await changeUserStatus({ id: id, status: newStatus });
        fetchSubDealers();
      } catch (error) {
        console.error("Failed to update status:", error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this sub-dealer? This action cannot be undone.",
      )
    ) {
      try {
        await deleteSubDealer(id);
        fetchSubDealers();
      } catch (error) {
        console.error("Failed to delete sub-dealer:", error);
      }
    }
  };

  const filteredSubDealers = subDealers.filter((dealer) =>
    dealer.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredSubDealers.length / itemsPerPage);
  const paginatedSubDealers = filteredSubDealers.slice(
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
                Date
              </TableHead>
              <TableHead className="px-3 py-2 font-bold text-xs">
                Sub-Dealer Name
              </TableHead>

              <TableHead className="px-3 py-2 font-bold text-xs">
                Contact
              </TableHead>

              <TableHead className="px-3 py-2 font-bold text-xs">
                Address
              </TableHead>
              <TableHead className="px-3 py-2 font-bold text-xs">
                Influencer categoryName
              </TableHead>
              <TableHead className="px-3 py-2 font-bold text-xs">
                Distributor Name
              </TableHead>

              <TableHead className="px-3 py-2 font-bold text-xs">
                Documents
              </TableHead>
              <TableHead className="px-3 py-2 font-bold text-xs">
                Status
              </TableHead>
              {/* <TableHead className="px-3 py-2 font-bold text-xs">
                Action
              </TableHead> */}
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedSubDealers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  No sub-dealers found
                </TableCell>
              </TableRow>
            ) : (
              paginatedSubDealers.map((dealer, index) => (
                <TableRow
                  key={dealer.id}
                  className="hover:bg-gray-50 border-b border-gray-200 transition-colors"
                >
                  <TableCell className="px-3 py-4 text-md text-[#44444A]">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md text-[#44444A]">
                    {(() => {
                      const d = dealer.createdAt as any;
                      if (!d) return "N/A";
                      if (d._seconds)
                        return new Date(d._seconds * 1000).toLocaleDateString();
                      if (d.seconds)
                        return new Date(d.seconds * 1000).toLocaleDateString();
                      if (d instanceof Date) return d.toLocaleDateString();
                      if (typeof d === "string" || typeof d === "number")
                        return new Date(d).toLocaleDateString();
                      if (typeof d.toDate === "function")
                        return d.toDate().toLocaleDateString();
                      return "N/A";
                    })()}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md text-[#44444A]">
                    {dealer.name}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md text-[#44444A]">
                    {dealer.phoneNumber}
                  </TableCell>

                  <TableCell className="px-3 py-4 text-md text-[#44444A]">
                    {dealer.address}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md text-gray-500">
                    {dealer.categoryName}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md text-[#44444A]">
                    {dealer.distributorName}
                  </TableCell>

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
                      {dealer.status !== "pending" && (
                        <Switch
                          checked={dealer.status === "active"}
                          onCheckedChange={() =>
                            handleStatusChange(dealer.id, dealer.status)
                          }
                          className={`${dealer.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                        />
                      )}
                      <span
                        className={`text-xs font-semibold ${
                          dealer.status === "active"
                            ? "text-green-600"
                            : dealer.status === "inactive"
                              ? "text-red-600"
                              : "text-orange-500"
                        }`}
                      >
                        {dealer.status === "active"
                          ? "Active"
                          : dealer.status === "inactive"
                            ? "Inactive"
                            : "Pending"}
                      </span>
                    </div>
                  </TableCell>

                  {/* <TableCell className="px-3 py-4 text-md">
                    <div className="flex items-center gap-2">
                      <EditSubDealerModal
                        dealer={dealer}
                        onSuccess={fetchSubDealers}
                        trigger={
                          <Button
                            variant="ghost"
                            className="flex items-center gap-2 text-[#F87B1B] px-3 py-2 rounded-lg font-semibold hover:bg-[#F87B1B1A]"
                            style={{ backgroundColor: "#F87B1B1A" }}
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(dealer.id)}
                        className="flex items-center gap-2 text-red-600 px-3 py-2 rounded-lg font-semibold hover:bg-red-50"
                        style={{ backgroundColor: "#fee2e2" }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell> */}
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
