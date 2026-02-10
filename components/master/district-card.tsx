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
import AddDistrictModal from "./add-district-modal"

interface DistrictData {
  sNo: number
  districtId: string
  districtName: string
  stateName: string
  status?: string
}

const districtData: DistrictData[] = [
  { sNo: 1, districtId: "#74657", districtName: "Raipur", stateName: "Chhattisgarh", status: "active" },
  { sNo: 2, districtId: "#74658", districtName: "Bilaspur", stateName: "Chhattisgarh", status: "active" },
]

export default function DistrictCard() {
  const [districts, setDistricts] = useState<DistrictData[]>(districtData)
  const [editingDistrict, setEditingDistrict] = useState<DistrictData | null>(null)

  const handleEditDistrict = (district: DistrictData) => {
    setEditingDistrict(district)
  }

  const handleSaveDistrict = (updatedDistrict: DistrictData) => {
    setDistricts(districts.map(d => d.sNo === updatedDistrict.sNo ? updatedDistrict : d))
    setEditingDistrict(null)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between ">
        <CardTitle className="text-lg font-semibold">District</CardTitle>
        <AddDistrictModal trigger={
          <Button className="bg-green-100 text-green-700 hover:bg-green-200 h-8 text-xs">
            + Add District
          </Button>
        } />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                <TableHead className="w-12 font-semibold text-gray-700">S No.</TableHead>
                <TableHead className="font-semibold text-gray-700">District Id</TableHead>
                <TableHead className="font-semibold text-gray-700">District Name</TableHead>
                <TableHead className="font-semibold text-gray-700">State Name</TableHead>
                <TableHead className="w-12 font-semibold text-gray-700"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {districts.map((district) => (
                <TableRow key={district.sNo} className="border-b hover:bg-gray-50">
                  <TableCell className="text-gray-700">{district.sNo}</TableCell>
                  <TableCell className="text-gray-700">{district.districtId}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      {district.districtName}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-700">{district.stateName}</TableCell>
                  <TableCell className="text-right">
                    <AddDistrictModal
                      initialData={editingDistrict?.sNo === district.sNo ? editingDistrict : district}
                      onSave={handleSaveDistrict}
                      trigger={
                        <button 
                          onClick={() => handleEditDistrict(district)}
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
