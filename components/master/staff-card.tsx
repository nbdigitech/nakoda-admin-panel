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
import AddStaffCategoryModal from "./add-staff-category-modal"

interface StaffCategoryData {
  sNo: number
  staffId: string
  categoryName: string
  status?: string
}

const staffCategoryData: StaffCategoryData[] = [
  { sNo: 1, staffId: "#74657", categoryName: "ADM", status: "active" },
  { sNo: 2, staffId: "#74658", categoryName: "Manager", status: "active" },
  { sNo: 3, staffId: "#74658", categoryName: "HRM", status: "active" },

]

export default function StaffCard() {
  const [editingStaff, setEditingStaff] = useState<StaffCategoryData | null>(null)

  const handleEditStaff = (item: StaffCategoryData) => {
    setEditingStaff(item)
  }

  const handleSaveStaff = (updatedItem: StaffCategoryData) => {
    setStaff(staff.map(s => s.sNo === updatedItem.sNo ? updatedItem : s))
    setEditingStaff(null)
  }
  const [staff, setStaff] = useState<StaffCategoryData[]>(staffCategoryData)

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between ">
        <CardTitle className="text-lg font-semibold">Staff</CardTitle>
        <AddStaffCategoryModal trigger={
          <Button className="bg-green-100 text-green-700 hover:bg-green-200 h-8 text-xs">
            + Add Staff
          </Button>
        } />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                <TableHead className="w-12 font-semibold text-gray-700">S No.</TableHead>
                <TableHead className="font-semibold text-gray-700">Staff Id</TableHead>
                <TableHead className="font-semibold text-gray-700">Category Name</TableHead>
                <TableHead className="w-12 font-semibold text-gray-700"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((item) => (
                <TableRow key={item.sNo} className="border-b hover:bg-gray-50">
                  <TableCell className="text-gray-700">{item.sNo}</TableCell>
                  <TableCell className="text-gray-700">{item.staffId}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      {item.categoryName}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <AddStaffCategoryModal
                      initialData={editingStaff?.sNo === item.sNo ? editingStaff : item}
                      onSave={handleSaveStaff}
                      trigger={
                        <button 
                          onClick={() => handleEditStaff(item)}
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
