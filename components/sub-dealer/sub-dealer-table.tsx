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
import { Button } from "@/components/ui/button";
import { Eye, Power } from "lucide-react";
import { getUsers, changeUserStatus } from "@/services/user";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";

interface SubDealer {
  id: string;
  name: string;
  phoneNumber: string;
  organizationName: string;
  districtId: string;
  email: string;
  influencerCategory: string;
  gstUrl: string;
  pancardUrl: string;
  aadhaarPath: string;
  status: string;
}

export default function SubDealerTable({
  statusFilter = "active",
}: {
  statusFilter?: string;
}) {
  const [subDealers, setSubDealers] = useState<SubDealer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubDealers = async () => {
    setLoading(true);
    try {
      const payload: any = { role: "influencer" };

      if (statusFilter !== "all") {
        payload.status = statusFilter;
      } else {
        payload.status = "";
      }

      const res = await getUsers(payload);
      if (res?.data) {
        setSubDealers(res.data);
      } else {
        setSubDealers([]);
      }
    } catch (error) {
      console.error("Failed to fetch sub-dealers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubDealers();
  }, [statusFilter]);

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

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        {/* Header */}
        <TableHeader>
          <TableRow>
            <TableHead className="px-3 py-2 font-bold text-xs">S No.</TableHead>
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
              Influencer Category
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
              <TableCell colSpan={10} className="text-center py-4">
                Loading...
              </TableCell>
            </TableRow>
          ) : subDealers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-4">
                No sub-dealers found
              </TableCell>
            </TableRow>
          ) : (
            subDealers.map((dealer, index) => (
              <TableRow
                key={dealer.id}
                className="hover:bg-gray-50 border-b border-gray-200 transition-colors"
              >
                <TableCell className="px-3 py-4 text-md text-[#44444A]">
                  {index + 1}
                </TableCell>
                <TableCell className="px-3 py-4 text-md text-[#44444A]">
                  {dealer.name}
                </TableCell>
                <TableCell className="px-3 py-4 text-md text-[#44444A]">
                  {dealer.phoneNumber}
                </TableCell>
                <TableCell className="px-3 py-4 text-md text-[#44444A]">
                  {dealer.organizationName}
                </TableCell>
                <TableCell className="px-3 py-4 text-md text-[#44444A]">
                  {dealer.districtId}
                </TableCell>
                <TableCell className="px-3 py-4 text-md text-[#44444A]">
                  {dealer.email}
                </TableCell>
                <TableCell className="px-3 py-4 text-md text-[#44444A]">
                  {dealer.influencerCategory || "-"}
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

                <TableCell className="px-3 py-2">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-[#F87B1B] font-semibold px-2 py-1 text-xs rounded-lg hover:bg-[#F87B1B1A]"
                      style={{ backgroundColor: "#F87B1B1A" }}
                    >
                      <Eye size={14} />
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
