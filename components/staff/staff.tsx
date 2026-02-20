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
import { Eye } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { getUsers, changeUserStatus } from "@/services/user";

interface Staff {
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
}

export default function StaffTable({
  statusFilter = "active",
}: {
  statusFilter?: string;
}) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const payload: any = { role: "asm" };
      if (statusFilter !== "all") {
        payload.status = statusFilter;
      } else {
        payload.status = "";
      }
      const res = await getUsers(payload);
      if (res?.data) {
        setStaff(res.data);
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

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        {/* Header */}
        <TableHeader>
          <TableRow>
            <TableHead className="px-3 py-2 font-bold text-xs">S No.</TableHead>
            <TableHead className="px-3 py-2 font-bold text-xs">
              Staff Name
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
          ) : staff.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-4">
                No staff found
              </TableCell>
            </TableRow>
          ) : (
            staff.map((member, index) => (
              <TableRow key={member.id} className="hover:bg-gray-50">
                <TableCell className="px-3 py-4 text-md">{index + 1}</TableCell>
                <TableCell className="px-3 py-4 text-md">
                  {member.name}
                </TableCell>
                <TableCell className="px-3 py-4 text-md">
                  {member.phoneNumber}
                </TableCell>
                <TableCell className="px-3 py-4 text-md">
                  {member.organizationName}
                </TableCell>
                <TableCell className="px-3 py-4 text-md">
                  {member.districtId}
                </TableCell>
                <TableCell className="px-3 py-4 text-md">
                  {member.email}
                </TableCell>
                <TableCell className="px-3 py-4 text-md">
                  {member.asmId || "-"}
                </TableCell>

                <TableCell className="px-3 py-2">
                  <div className="flex gap-2 flex-wrap max-w-[150px]">
                    {member.gstUrl && (
                      <Link
                        href={member.gstUrl}
                        target="_blank"
                        className="flex items-center gap-1 cursor-pointer hover:opacity-80 bg-gray-100 p-1 rounded"
                      >
                        <span className="text-xs text-blue-600 font-medium">
                          GST
                        </span>
                      </Link>
                    )}
                    {member.pancardUrl && (
                      <Link
                        href={member.pancardUrl}
                        target="_blank"
                        className="flex items-center gap-1 cursor-pointer hover:opacity-80 bg-gray-100 p-1 rounded"
                      >
                        <span className="text-xs text-blue-600 font-medium">
                          PAN
                        </span>
                      </Link>
                    )}
                    {member.aadhaarPath && (
                      <Link
                        href={member.aadhaarPath}
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

                <TableCell className="px-3 py-2">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-[#F87B1B] font-semibold px-2 py-1 text-xs rounded-lg hover:bg-[#F87B1B1A]"
                      style={{ backgroundColor: "#F87B1B1A" }}
                    >
                      <Eye className="w-3 h-3" />
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
