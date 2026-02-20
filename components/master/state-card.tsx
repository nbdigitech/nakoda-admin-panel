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
import { Edit } from "lucide-react";
import AddStateModal from "./add-state-modal";
import { useMasterData } from "@/context/MasterDataContext";
import { deleteState } from "@/services/masterData";
import { Trash2 } from "lucide-react";

interface StateData {
  id: string;
  stateName: string;
  status?: string;
}

export default function StateCard() {
  const { states, refreshStates, loading } = useMasterData();

  const handleDeleteState = async (docId: string) => {
    if (confirm("Are you sure you want to delete this state?")) {
      try {
        await deleteState({ docId });
        refreshStates();
      } catch (error) {
        console.error("Failed to delete state:", error);
      }
    }
  };

  const handleSaveState = (updatedData?: StateData) => {
    refreshStates();
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between ">
        <CardTitle className="text-lg font-semibold">State</CardTitle>
        <AddStateModal
          onSave={handleSaveState}
          trigger={
            <Button className="bg-green-100 text-green-700 hover:bg-green-200 h-8 text-xs">
              + Add State
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
                  <TableCell colSpan={4} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : states.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No states found
                  </TableCell>
                </TableRow>
              ) : (
                states.map((state, index) => (
                  <TableRow
                    key={state.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <TableCell className="text-gray-700">{index + 1}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${state.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                        ></span>
                        {state.stateName}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <AddStateModal
                          initialData={state}
                          onSave={handleSaveState}
                          trigger={
                            <button className="text-orange-500 hover:text-orange-600">
                              <Edit className="w-4 h-4" />
                            </button>
                          }
                        />
                        <button
                          onClick={() => handleDeleteState(state.id)}
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
