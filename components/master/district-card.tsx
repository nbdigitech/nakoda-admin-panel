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
import AddDistrictModal from "./add-district-modal";
import { deleteDistrict } from "@/services/masterData";
import { Trash2, Edit } from "lucide-react";
import { useMasterData } from "@/context/MasterDataContext";

interface DistrictData {
  id: string;
  districtName: string;
  stateId: string;
  status?: string;
}

export default function DistrictCard() {
  const { districts, states, refreshDistricts, loading } = useMasterData();

  const handleDeleteDistrict = async (docId: string) => {
    if (confirm("Are you sure you want to delete this district?")) {
      try {
        await deleteDistrict({ docId });
        refreshDistricts();
      } catch (error) {
        console.error("Failed to delete district:", error);
      }
    }
  };

  const handleSaveDistrict = (updatedData?: DistrictData) => {
    refreshDistricts();
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between ">
        <CardTitle className="text-lg font-semibold">District</CardTitle>
        <AddDistrictModal
          onSave={handleSaveDistrict}
          trigger={
            <Button className="bg-green-100 text-green-700 hover:bg-green-200 h-8 text-xs">
              + Add District
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
                  District Name
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  State Name
                </TableHead>
                <TableHead className="w-24 font-semibold text-gray-700 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : districts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No districts found
                  </TableCell>
                </TableRow>
              ) : (
                districts.map((district, index) => (
                  <TableRow
                    key={district.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <TableCell className="text-gray-700">{index + 1}</TableCell>

                    <TableCell>
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${district.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                        ></span>
                        {district.districtName}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {states.find((s) => s.id === district.stateId)
                        ?.stateName || district.stateId}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <AddDistrictModal
                          initialData={district}
                          onSave={handleSaveDistrict}
                          trigger={
                            <button className="text-orange-500 hover:text-orange-600">
                              <Edit className="w-4 h-4" />
                            </button>
                          }
                        />
                        <button
                          onClick={() => handleDeleteDistrict(district.id)}
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
