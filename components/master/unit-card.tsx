"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, Edit2 } from "lucide-react"
import AddUnitModal from "./add-unit-modal"

interface UnitData {
  sNo: number
  unitId: string
  unitName: string
  subName: string
  status?: string
}

const unitData: UnitData[] = [
  { sNo: 1, unitId: "#IJ3107", unitName: "Kilogram", subName: "KG", status: "active" },
  { sNo: 2, unitId: "#IJ3108", unitName: "Ton", subName: "Tn", status: "active" },
]

export default function UnitCard() {
  const [units, setUnits] = useState<UnitData[]>(unitData)
  const [editingUnit, setEditingUnit] = useState<UnitData | null>(null)

  const handleEditUnit = (unit: UnitData) => {
    setEditingUnit(unit)
  }

  const handleSaveUnit = (updatedUnit: UnitData) => {
    setUnits(units.map(u => u.sNo === updatedUnit.sNo ? updatedUnit : u))
    setEditingUnit(null)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between ">
        <CardTitle className="text-lg font-semibold">Unit</CardTitle>
        <AddUnitModal trigger={
          <Button className="bg-green-100 text-green-700 hover:bg-green-200 h-8 text-xs">
            + Add Unit
          </Button>
        } />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                <TableHead className="w-12 font-semibold text-gray-700">S No.</TableHead>
                <TableHead className="font-semibold text-gray-700">Unit Id</TableHead>
                <TableHead className="font-semibold text-gray-700">Unit Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Sub Name</TableHead>
                <TableHead className="w-12 font-semibold text-gray-700"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit.sNo} className="border-b hover:bg-gray-50">
                  <TableCell className="text-gray-700">{unit.sNo}</TableCell>
                  <TableCell className="text-gray-700">{unit.unitId}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      {unit.unitName}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-700">{unit.subName}</TableCell>
                  <TableCell className="text-right">
                    <AddUnitModal
                      initialData={editingUnit?.sNo === unit.sNo ? editingUnit : unit}
                      onSave={handleSaveUnit}
                      trigger={
                        <button 
                          onClick={() => handleEditUnit(unit)}
                          className="text-orange-500 hover:text-orange-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
