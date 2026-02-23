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
import { Eye, ChevronLeft, ChevronRight, X, FileText } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUsers, changeUserStatus } from "@/services/user";

interface Staff {
  id: string;
  name: string;
  phoneNumber: string;
  districtId: string;
  email: string;
  asmId: string;
  gstUrl: string;
  pancardUrl: string;
  aadhaarPath: string;
  imagePath: string;
  status: string;
  role: string;
  permissions?: string[];
}

export default function StaffTable({
  statusFilter = "active",
  searchTerm = "",
}: {
  statusFilter?: string;
  searchTerm?: string;
}) {
  const [staff, setStaff] = useState<Staff[]>([]);
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

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const payload: any =
        statusFilter !== "all" ? { role: "asm", status: statusFilter } : {};
      const res = await getUsers(payload);
      if (res?.data) {
        let staffData = res.data;
        if (statusFilter === "all") {
          staffData = staffData.filter((u: any) => u.role === "asm");
        }
        setStaff(staffData);
        setCurrentPage(1); // Reset to first page
      } else {
        setStaff([]);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    if (
      confirm(
        `Are you sure you want to ${newStatus === "active" ? "activate" : "deactivate"} this staff member?`,
      )
    ) {
      try {
        await changeUserStatus({ id: id, status: newStatus });
        fetchStaff();
      } catch (error) {
        console.error("Failed to update status:", error);
      }
    }
  };

  const filteredStaff = staff.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = filteredStaff.slice(
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
                Staff Name
              </TableHead>
              <TableHead className="px-3 py-2 font-bold text-xs">
                Contact
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
                Permissions
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
            ) : paginatedStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No staff found
                </TableCell>
              </TableRow>
            ) : (
              paginatedStaff.map((member, index) => (
                <TableRow key={member.id} className="hover:bg-gray-50">
                  <TableCell className="px-3 py-4 text-md">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-sm font-bold text-gray-900">
                    {member.name}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md">
                    {member.phoneNumber}
                  </TableCell>

                  <TableCell className="px-3 py-4 text-md">
                    {member.districtId?.substring(0, 8) || "-"}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md">
                    {member.email}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md">
                    {member.id?.substring(0, 8) || "-"}
                  </TableCell>
                  <TableCell className="px-3 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {member.permissions && member.permissions.length > 0 ? (
                        member.permissions.map((p, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-[10px] bg-blue-50 text-blue-600 border-blue-100 whitespace-nowrap"
                          >
                            {p}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      {/* Thumbnail as main trigger */}
                      <div
                        className="relative cursor-pointer"
                        onClick={() => {
                          const isPdf = (url: string) =>
                            url?.toLowerCase().includes(".pdf");
                          if (member.imagePath && isPdf(member.imagePath)) {
                            window.open(member.imagePath, "_blank");
                            return;
                          }
                          if (member.imagePath) {
                            openViewer(
                              [
                                {
                                  url: member.imagePath,
                                  label: "Profile Image",
                                },
                              ],
                              0,
                            );
                          }
                        }}
                      >
                        {member.imagePath ? (
                          member.imagePath.toLowerCase().includes(".pdf") ? (
                            <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex flex-col items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors">
                              <FileText className="w-5 h-5" />
                              <span className="text-[8px] font-bold">PDF</span>
                            </div>
                          ) : (
                            <img
                              src={member.imagePath}
                              alt="avatar"
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 hover:border-orange-400 transition-colors shadow-sm"
                            />
                          )
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                            <Eye className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Other Documents */}
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          {member.gstUrl && (
                            <Link
                              href={member.gstUrl}
                              target="_blank"
                              className="text-[10px] bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded font-medium hover:bg-gray-200 border border-gray-200"
                            >
                              GST
                            </Link>
                          )}
                          {member.pancardUrl && (
                            <Link
                              href={member.pancardUrl}
                              target="_blank"
                              className="text-[10px] bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded font-medium hover:bg-gray-200 border border-gray-200"
                            >
                              PAN
                            </Link>
                          )}
                        </div>
                        {member.aadhaarPath && (
                          <div
                            className="w-fit"
                            onClick={() => {
                              if (
                                member.aadhaarPath
                                  .toLowerCase()
                                  .includes(".pdf")
                              ) {
                                window.open(member.aadhaarPath, "_blank");
                              } else {
                                openViewer(
                                  [
                                    {
                                      url: member.aadhaarPath,
                                      label: "Aadhaar",
                                    },
                                  ],
                                  0,
                                );
                              }
                            }}
                          >
                            {member.aadhaarPath
                              .toLowerCase()
                              .includes(".pdf") ? (
                              <div className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-bold hover:bg-orange-100 border border-orange-100 flex items-center gap-1 cursor-pointer">
                                <FileText className="w-3 h-3" />
                                Aadhaar
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-500 font-medium cursor-pointer hover:text-orange-500 transition-colors">
                                + Aadhaar Card
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-3 py-4 text-md">
                    <div className="flex flex-col items-center gap-1">
                      <Switch
                        checked={member.status === "active"}
                        onCheckedChange={() =>
                          handleStatusChange(member.id, member.status)
                        }
                        className={`${member.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span
                        className={`text-xs font-semibold ${member.status === "active" ? "text-green-600" : "text-red-600"}`}
                      >
                        {member.status === "active" ? "Active" : "Inactive"}
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
