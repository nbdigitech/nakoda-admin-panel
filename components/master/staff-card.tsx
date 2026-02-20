"use client";

import { useState } from "react";
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
import { Trash2, Edit } from "lucide-react";
import AddStaffCategoryModal from "./add-staff-category-modal";

import { useMasterData } from "@/context/MasterDataContext";
import { deleteDesignation } from "@/services/masterData";

interface StaffCategoryData {
  id: string;
  staffCategoryName: string;
  status?: string;
}

export default function StaffCard() {
  const {
    designations: staff,
    refreshDesignations: fetchStaff,
    loading,
  } = useMasterData();

  const handleDeleteStaff = async (docId: string) => {
    if (confirm("Are you sure you want to delete this designation?")) {
      try {
        await deleteDesignation({ docId });
        fetchStaff();
      } catch (error) {
        console.error("Failed to delete designation:", error);
      }
    }
  };

  const handleSaveStaff = () => {
    fetchStaff();
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between ">
        <CardTitle className="text-lg font-semibold">Staff</CardTitle>
        <AddStaffCategoryModal
          trigger={
            <Button className="bg-green-100 text-green-700 hover:bg-green-200 h-8 text-xs">
              + Add Staff
            </Button>
          }
        />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-auto max-h-[300px]">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                <TableHead className="w-12 font-semibold text-gray-700">
                  S No.
                </TableHead>

                <TableHead className="font-semibold text-gray-700">
                  Category Name
                </TableHead>
                <TableHead className="w-12 font-semibold text-gray-700"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No designations found
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((item, index) => (
                  <TableRow key={item.id} className="border-b hover:bg-gray-50">
                    <TableCell className="text-gray-700">{index + 1}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            item.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        ></span>
                        {item.staffCategoryName}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <AddStaffCategoryModal
                          initialData={item}
                          onSave={handleSaveStaff}
                          trigger={
                            <button className="text-orange-500 hover:text-orange-600">
                              <Edit className="w-4 h-4" />
                            </button>
                          }
                        />
                        <button
                          onClick={() => handleDeleteStaff(item.id)}
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
    </Card>
  );
}
