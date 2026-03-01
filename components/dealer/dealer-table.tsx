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
import {
  Edit,
  Eye,
  Power,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  User,
  Trash2,
} from "lucide-react";
import { changeUserStatus } from "@/services/user";
import { getDealers, deleteDealer } from "@/services/dealer";
import { ref, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "@/firebase";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditDealerModal from "./edit-dealer-modal";
import { getDistrict } from "@/services/masterData";

interface Dealer {
  id: string;
  name: string;
  phoneNumber: string;
  organizationName: string;
  districtId: string;
  email: string;
  asmId: string;
  asmName?: string;
  gstUrl: string;
  pancardUrl: string;
  aadhaarPath: string;
  status: string;
  role: string;
  logoUrl?: string;
  permissions?: string[];
}

export default function DealerTable({
  activeTab = "All",
  statusFilter = "active",
  searchTerm = "",
  refreshTrigger = 0,
}: {
  activeTab?: string;
  statusFilter?: string;
  searchTerm?: string;
  refreshTrigger?: number;
}) {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [districts, setDistricts] = useState<any[]>([]);
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

  const handleDocumentClick = async (path: string, label: string) => {
    if (!path) return;
    let url = path;
    if (!url.startsWith("http")) {
      try {
        const storage = getFirebaseStorage();
        url = await getDownloadURL(ref(storage, path));
      } catch (error) {
        console.error(`Error resolving ${label} URL:`, error);
      }
    }

    let isPdf =
      url?.toLowerCase().includes(".pdf") ||
      path?.toLowerCase().includes(".pdf");

    // Check actual file content since backend sometimes saves images with .pdf extension
    if (url.startsWith("http")) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const text = await blob.slice(0, 5).text();
        isPdf = text === "%PDF-";
      } catch (e) {
        // Silently fail if CORS blocks the fetch, fallback to extension
      }
    }

    if (isPdf) {
      window.open(url, "_blank");
    } else {
      openViewer([{ url, label }], 0);
    }
  };

  const nextDoc = () => {
    setCurrentDocIndex((prev) => (prev + 1) % selectedDocs.length);
  };

  const prevDoc = () => {
    setCurrentDocIndex(
      (prev) => (prev - 1 + selectedDocs.length) % selectedDocs.length,
    );
  };

  const handleAvatarClick = async (dealer: Dealer) => {
    let logoUrlStr = dealer.logoUrl;
    if (logoUrlStr && !logoUrlStr.startsWith("http")) {
      try {
        const storage = getFirebaseStorage();
        logoUrlStr = await getDownloadURL(ref(storage, logoUrlStr));
      } catch (e) {
        console.error(e);
      }
    }

    const sniffIsPdf = async (
      testUrl: string | undefined,
    ): Promise<boolean> => {
      if (!testUrl) return false;
      let isPdfExt = testUrl.toLowerCase().includes(".pdf");
      if (testUrl.startsWith("http")) {
        try {
          const response = await fetch(testUrl);
          const blob = await response.blob();
          const text = await blob.slice(0, 5).text();
          return text === "%PDF-";
        } catch {
          return isPdfExt;
        }
      }
      return isPdfExt;
    };

    const isLogoPdf = await sniffIsPdf(logoUrlStr);

    if (logoUrlStr && isLogoPdf) {
      window.open(logoUrlStr, "_blank");
      return;
    }

    const sliderDocs: { url: string; label: string }[] = [];
    if (logoUrlStr) {
      sliderDocs.push({
        url: logoUrlStr,
        label: "Profile Image",
      });
    }

    let aadhaarPdf = false;
    let aadhaarUrlStr = dealer.aadhaarPath;
    if (aadhaarUrlStr) {
      if (!aadhaarUrlStr.startsWith("http")) {
        try {
          const storage = getFirebaseStorage();
          aadhaarUrlStr = await getDownloadURL(ref(storage, aadhaarUrlStr));
        } catch (e) {
          console.error(e);
        }
      }
      aadhaarPdf = await sniffIsPdf(aadhaarUrlStr);
    }

    if (aadhaarUrlStr && !aadhaarPdf) {
      sliderDocs.push({
        url: aadhaarUrlStr,
        label: "Aadhaar",
      });
    }

    if (sliderDocs.length > 0) {
      openViewer(sliderDocs, 0);
    }
  };

  const fetchDealers = async () => {
    const applyFiltersAndSort = (rawData: any[]) => {
      let dealersData = [...rawData];

      if (statusFilter !== "all") {
        dealersData = dealersData.filter(
          (u: any) => u.status?.toLowerCase() === statusFilter.toLowerCase(),
        );
      }

      if (activeTab === "Today") {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        dealersData = dealersData.filter((u: any) => {
          const parseDate = (d: any) => {
            if (!d) return 0;
            if (d._seconds) return d._seconds * 1000;
            if (typeof d === "string" || typeof d === "number")
              return new Date(d).getTime();
            if (d.toDate) return d.toDate().getTime();
            return 0;
          };
          const dTime = parseDate(u.createdAt);
          return (
            dTime >= startOfToday.getTime() && dTime <= endOfToday.getTime()
          );
        });
      }

      dealersData.sort((a: any, b: any) => {
        const parseDate = (d: any) => {
          if (!d) return 0;
          if (d._seconds) return d._seconds * 1000;
          if (typeof d === "string" || typeof d === "number")
            return new Date(d).getTime();
          if (d.toDate) return d.toDate().getTime();
          return 0;
        };
        return parseDate(b.createdAt) - parseDate(a.createdAt); // newest first
      });
      return dealersData;
    };

    try {
      setLoading(true);

      const res = await getDealers();
      if (res && res.length > 0) {
        setDealers(applyFiltersAndSort(res));
        setCurrentPage(1);
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
  }, [statusFilter, refreshTrigger, activeTab]);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res: any = await getDistrict({});
        const data = res?.data?.data || res?.data || res || [];
        setDistricts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load districts for dealer table", error);
      }
    };
    fetchDistricts();
  }, []);

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

  // const handleDelete = async (id: string) => {
  //   if (
  //     confirm(
  //       "Are you sure you want to delete this dealer? This action cannot be undone.",
  //     )
  //   ) {
  //     try {
  //       await deleteDealer(id);
  //       fetchDealers();
  //     } catch (error) {
  //       console.error("Failed to delete dealer:", error);
  //     }
  //   }
  // };

  const filteredDealers = dealers.filter(
    (dealer) =>
      dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dealer.asmName || "").toLowerCase().includes(searchTerm.toLowerCase()),
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
                ASM Name
              </TableHead>

              <TableHead className="px-3 py-2 font-bold text-xs">
                Documents
              </TableHead>
              <TableHead className="px-3 py-2 font-bold text-xs">
                Status
              </TableHead>
              <TableHead className="px-3 py-2 font-bold text-xs">
                Action
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
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {dealer.logoUrl ? (
                          dealer.logoUrl.toLowerCase().includes(".pdf") ? (
                            <div
                              onClick={() => handleAvatarClick(dealer)}
                              className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-200 cursor-pointer hover:bg-orange-100"
                              title="View PDF Logo"
                            >
                              <FileText className="w-5 h-5" />
                            </div>
                          ) : dealer.logoUrl.startsWith("http") ? (
                            <img
                              src={dealer.logoUrl}
                              alt="logo"
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 hover:border-orange-400 transition-colors shadow-sm cursor-pointer"
                              onClick={() => handleAvatarClick(dealer)}
                            />
                          ) : (
                            <div
                              onClick={() => handleAvatarClick(dealer)}
                              className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-200 cursor-pointer hover:bg-blue-100"
                              title="View Avatar"
                            >
                              <User className="w-5 h-5" />
                            </div>
                          )
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                            <User className="w-4 h-4 opacity-50" />
                          </div>
                        )}
                      </div>
                      <span className="font-bold">{dealer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md">
                    {dealer.phoneNumber}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md">
                    {dealer.organizationName}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md">
                    {districts.find(
                      (d: any) =>
                        d.id === dealer.districtId ||
                        d._id === dealer.districtId,
                    )?.districtName ||
                      districts.find(
                        (d: any) =>
                          d.id === dealer.districtId ||
                          d._id === dealer.districtId,
                      )?.name ||
                      dealer.districtId?.substring(0, 8) ||
                      "-"}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md text-gray-500">
                    {dealer.email}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md">
                    {dealer.asmName || "-"}
                  </TableCell>

                  {/* Documents Column */}
                  <TableCell className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1 justify-center">
                          {dealer.gstUrl && (
                            <span
                              onClick={() =>
                                handleDocumentClick(dealer.gstUrl, "GST")
                              }
                              className="text-[10px] bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded font-medium hover:bg-gray-200 cursor-pointer"
                            >
                              GST
                            </span>
                          )}
                          {dealer.pancardUrl && (
                            <span
                              onClick={() =>
                                handleDocumentClick(dealer.pancardUrl, "PAN")
                              }
                              className="text-[10px] bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded font-medium hover:bg-gray-200 cursor-pointer"
                            >
                              PAN
                            </span>
                          )}
                        </div>
                        {dealer.aadhaarPath && (
                          <div
                            className="w-fit"
                            onClick={() =>
                              handleDocumentClick(dealer.aadhaarPath, "Aadhaar")
                            }
                          >
                            {dealer.aadhaarPath
                              .toLowerCase()
                              .includes(".pdf") ||
                            dealer.aadhaarPath.startsWith("users/") ? (
                              <div className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-bold hover:bg-orange-100 border border-orange-100 flex items-center gap-1 cursor-pointer">
                                <FileText className="w-3 h-3" />
                                Aadhaar
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-500 font-medium cursor-pointer hover:text-orange-500 transition-colors">
                                <Eye className="w-3 h-3 inline mr-1" />
                                Aadhaar
                              </span>
                            )}
                          </div>
                        )}
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

                  <TableCell className="px-3 py-4 text-md">
                    <div className="flex items-center gap-2">
                      <EditDealerModal
                        dealer={dealer}
                        onSuccess={fetchDealers}
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
                      {/* <Button
                        variant="ghost"
                        onClick={() => handleDelete(dealer.id)}
                        className="flex items-center gap-2 text-red-600 px-3 py-2 rounded-lg font-semibold hover:bg-red-50"
                        style={{ backgroundColor: "#fee2e2" }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button> */}
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
          {(() => {
            const pages = [];
            const groupSize = 3;
            const groupIndex = Math.floor((currentPage - 1) / groupSize);
            const startPage = groupIndex * groupSize + 1;
            const endPage = Math.min(totalPages, startPage + groupSize - 1);

            for (let i = startPage; i <= endPage; i++) {
              pages.push(i);
            }
            return pages.map((page) => (
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
            ));
          })()}
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
