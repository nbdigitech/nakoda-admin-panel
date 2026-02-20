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
import AddUnitModal from "./add-unit-modal";
import { deleteUnit } from "@/services/masterData";
import { Trash2, Edit } from "lucide-react";
import { useMasterData } from "@/context/MasterDataContext";

interface UnitData {
  id: string;
  unitName: string;
  subName: string;
  status?: string;
}

export default function UnitCard() {
  const { units, refreshUnits, loading } = useMasterData();

  const handleDeleteUnit = async (docId: string) => {
    if (confirm("Are you sure you want to delete this unit?")) {
      try {
        await deleteUnit({ docId });
        refreshUnits();
      } catch (error) {
        console.error("Failed to delete unit:", error);
      }
    }
  };

  const handleSaveUnit = (updatedData?: UnitData) => {
    refreshUnits();
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between ">
        <CardTitle className="text-lg font-semibold">Unit</CardTitle>
        <AddUnitModal
          onSave={handleSaveUnit}
          trigger={
            <Button className="bg-green-100 text-green-700 hover:bg-green-200 h-8 text-xs">
              + Add Unit
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
                  Unit Name
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Sub Name
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
              ) : units.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No units found
                  </TableCell>
                </TableRow>
              ) : (
                units.map((unit, index) => (
                  <TableRow key={unit.id} className="border-b hover:bg-gray-50">
                    <TableCell className="text-gray-700">{index + 1}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {unit.unitName}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {unit.subName}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <AddUnitModal
                          initialData={unit}
                          onSave={handleSaveUnit}
                          trigger={
                            <button className="text-orange-500 hover:text-orange-600">
                              <Edit className="w-4 h-4" />
                            </button>
                          }
                        />
                        <button
                          onClick={() => handleDeleteUnit(unit.id)}
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
