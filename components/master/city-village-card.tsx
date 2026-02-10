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
import AddCityVillageModal from "./add-city-village-modal"

interface CityVillageData {
  sNo: number
  cvId: string
  cityVillage: string
  district: string
  state: string
  status?: string
}

const cityVillageData: CityVillageData[] = [
  { sNo: 1, cvId: "#IJ3107", cityVillage: "Raipur", district: "Raipur", state: "Chhattisgarh", status: "active" },
  { sNo: 2, cvId: "#IJ3108", cityVillage: "Arang", district: "Raipur", state: "Chhattisgarh", status: "active" },
]

export default function CityVillageCard() {
  const [cities, setCities] = useState<CityVillageData[]>(cityVillageData)
  const [editingCity, setEditingCity] = useState<CityVillageData | null>(null)

  const handleEditCity = (city: CityVillageData) => {
    setEditingCity(city)
  }

  const handleSaveCity = (updatedCity: CityVillageData) => {
    setCities(cities.map(c => c.sNo === updatedCity.sNo ? updatedCity : c))
    setEditingCity(null)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between ">
        <CardTitle className="text-lg font-semibold">City/Village</CardTitle>
        <AddCityVillageModal trigger={
          <Button className="bg-green-100 text-green-700 hover:bg-green-200 h-8 text-xs">
            + Add City/Village
          </Button>
        } />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                <TableHead className="w-12 font-semibold text-gray-700">S No.</TableHead>
                <TableHead className="font-semibold text-gray-700">CV Id</TableHead>
                <TableHead className="font-semibold text-gray-700">City/Village</TableHead>
                <TableHead className="font-semibold text-gray-700">District</TableHead>
                <TableHead className="font-semibold text-gray-700">State</TableHead>
                <TableHead className="w-12 font-semibold text-gray-700"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities.map((city) => (
                <TableRow key={city.sNo} className="border-b hover:bg-gray-50">
                  <TableCell className="text-gray-700">{city.sNo}</TableCell>
                  <TableCell className="text-gray-700">{city.cvId}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      {city.cityVillage}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-700">{city.district}</TableCell>
                  <TableCell className="text-gray-700">{city.state}</TableCell>
                  <TableCell className="text-right">
                    <AddCityVillageModal
                      initialData={editingCity?.sNo === city.sNo ? editingCity : city}
                      onSave={handleSaveCity}
                      trigger={
                        <button 
                          onClick={() => handleEditCity(city)}
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
