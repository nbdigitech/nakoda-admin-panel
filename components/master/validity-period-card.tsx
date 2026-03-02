"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useMasterData } from "@/context/MasterDataContext";
import { deleteValidityPeriod } from "@/services/masterData";
import AddValidityPeriodModal from "./add-validity-period-modal";

export default function ValidityPeriodCard() {
  const { validityPeriods, refreshValidityPeriods, loading } = useMasterData();

  const handleDelete = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this validity period?")
    ) {
      try {
        await deleteValidityPeriod({ docId: id });
        refreshValidityPeriods();
      } catch (error) {
        console.error("Failed to delete validity period:", error);
      }
    }
  };

  return (
    <Card className="shadow-none border-2 border-gray-100 rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 bg-gray-50/50 py-4 px-6">
        <CardTitle className="text-base font-bold text-gray-800">
          Validity Periods
        </CardTitle>
        <AddValidityPeriodModal
          onSave={refreshValidityPeriods}
          trigger={
            <Button
              size="sm"
              className="bg-[#F87B1B] hover:bg-[#F87B1B]/90 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New
            </Button>
          }
        />
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-white sticky top-0 z-10">
              <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableHead className="text-[11px] font-bold text-gray-500 uppercase px-6 py-3">
                  Period (Days)
                </TableHead>
                <TableHead className="text-[11px] font-bold text-gray-500 uppercase px-6 py-3">
                  Status
                </TableHead>
                <TableHead className="text-[11px] font-bold text-gray-500 uppercase px-6 py-3 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && validityPeriods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-200 border-t-[#F87B1B] rounded-full animate-spin" />
                      <span className="text-xs text-gray-400 font-medium">
                        Loading...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : validityPeriods.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-10 text-gray-400 text-xs font-medium italic"
                  >
                    No validity periods found
                  </TableCell>
                </TableRow>
              ) : (
                validityPeriods.map((period) => (
                  <TableRow
                    key={period.id}
                    className="hover:bg-gray-50/50 border-b border-gray-50 transition-colors"
                  >
                    <TableCell className="px-6 py-4 text-sm font-semibold text-gray-700">
                      {period.validityPeriod} Days
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          period.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {period.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <AddValidityPeriodModal
                          initialData={period}
                          onSave={refreshValidityPeriods}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-[#F87B1B] hover:bg-[#F87B1B]/10 rounded-lg"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(period.id)}
                          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
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
