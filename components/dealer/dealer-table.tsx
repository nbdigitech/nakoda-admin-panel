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
import { Button } from "@/components/ui/button";
import { Edit, Eye, Power } from "lucide-react";
import { getUsers, changeUserStatus } from "@/services/user";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";

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
                    {dealer.districtId}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md">
                    {dealer.email}
                  </TableCell>
                  <TableCell className="px-3 py-4 text-md">
                    {dealer.asmId || "-"}
                  </TableCell>

                  {/* Documents Column */}
                  <TableCell className="px-3 py-2">
                    <div className="flex gap-2 flex-wrap max-w-[150px]">
                      {dealer.gstUrl && (
                        <Link
                          href={dealer.gstUrl}
                          target="_blank"
                          className="flex items-center gap-1 cursor-pointer hover:opacity-80 bg-gray-100 p-1 rounded"
                        >
                          <span className="text-xs text-blue-600 font-medium">
                            GST
                          </span>
                        </Link>
                      )}
                      {dealer.pancardUrl && (
                        <Link
                          href={dealer.pancardUrl}
                          target="_blank"
                          className="flex items-center gap-1 cursor-pointer hover:opacity-80 bg-gray-100 p-1 rounded"
                        >
                          <span className="text-xs text-blue-600 font-medium">
                            PAN
                          </span>
                        </Link>
                      )}
                      {dealer.aadhaarPath && (
                        <Link
                          href={dealer.aadhaarPath}
                          target="_blank"
                          className="flex items-center gap-1 cursor-pointer hover:opacity-80 bg-gray-100 p-1 rounded"
                        >
                          <span className="text-xs text-blue-600 font-medium">
                            Aadhaar
                          </span>
                        </Link>
                      )}
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
    </div>
  );
}
