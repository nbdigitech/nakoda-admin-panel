"use client";

import { deleteInfluencerCategory } from "@/services/masterData";
import { Trash2, Edit } from "lucide-react";
import { useMasterData } from "@/context/MasterDataContext";

interface InfluencerCategoryData {
  id: string;
  categoryName: string;
  status?: string;
}

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
import AddInfluencerCategoryModal from "./add-influencer-category-modal";

export default function InfluencerCategoryCard() {
  const {
    influencerCategories: categories,
    refreshInfluencerCategories: fetchCategories,
    loading,
  } = useMasterData();

  const handleDeleteCategory = async (docId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteInfluencerCategory({ docId });
        fetchCategories();
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  };

  const handleSaveCategory = (updatedData?: InfluencerCategoryData) => {
    fetchCategories();
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          Influencer Category
        </CardTitle>
        <AddInfluencerCategoryModal
          onSave={handleSaveCategory}
          trigger={
            <Button className="bg-green-100 text-green-700 hover:bg-green-200 h-8 text-xs">
              + Add Category
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
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category, index) => (
                  <TableRow
                    key={category.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <TableCell className="text-gray-700">{index + 1}</TableCell>

                    <TableCell>
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${category.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                        ></span>
                        {category.categoryName}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <AddInfluencerCategoryModal
                          initialData={category}
                          onSave={handleSaveCategory}
                          trigger={
                            <button className="text-orange-500 hover:text-orange-600">
                              <Edit className="w-4 h-4" />
                            </button>
                          }
                        />
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
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
