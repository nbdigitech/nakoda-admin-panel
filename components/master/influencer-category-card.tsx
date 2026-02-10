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
import AddInfluencerCategoryModal from "./add-influencer-category-modal"

interface InfluencerCategoryData {
  sNo: number
  influencerId: string
  categoryName: string
  status?: string
}

const influencerCategoryData: InfluencerCategoryData[] = [
  { sNo: 1, influencerId: "#74657", categoryName: "Engineer", status: "active" },
  { sNo: 2, influencerId: "#74658", categoryName: "Contractor", status: "active" },
]

export default function InfluencerCategoryCard() {
  const [categories, setCategories] = useState<InfluencerCategoryData[]>(influencerCategoryData)
  const [editingCategory, setEditingCategory] = useState<InfluencerCategoryData | null>(null)

  const handleEditCategory = (category: InfluencerCategoryData) => {
    setEditingCategory(category)
  }

  const handleSaveCategory = (updatedCategory: InfluencerCategoryData) => {
    setCategories(categories.map(c => c.sNo === updatedCategory.sNo ? updatedCategory : c))
    setEditingCategory(null)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Influencer Category</CardTitle>
        <AddInfluencerCategoryModal trigger={
          <Button className="bg-green-100 text-green-700 hover:bg-green-200 h-8 text-xs">
            + Add Category
          </Button>
        } />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                <TableHead className="w-12 font-semibold text-gray-700">S No.</TableHead>
                <TableHead className="font-semibold text-gray-700">Influencer Id</TableHead>
                <TableHead className="font-semibold text-gray-700">Category Name</TableHead>
                <TableHead className="w-12 font-semibold text-gray-700"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.sNo} className="border-b hover:bg-gray-50">
                  <TableCell className="text-gray-700">{category.sNo}</TableCell>
                  <TableCell className="text-gray-700">{category.influencerId}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      {category.categoryName}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <AddInfluencerCategoryModal
                      initialData={editingCategory?.sNo === category.sNo ? editingCategory : category}
                      onSave={handleSaveCategory}
                      trigger={
                        <button 
                          onClick={() => handleEditCategory(category)}
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
