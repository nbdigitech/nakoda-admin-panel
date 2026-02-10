"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText, Edit, Plus, Minus, Download } from "lucide-react"
import ExpenseRemarkDrawer from "@/components/asm/expense-remark-drawer"

interface Expense {
  id: number
  category: string
  amount: string
  image?: string
}

interface SurveyRoute {
  id: number
  title: string
  date: string
  expenses: Expense[]
  totalExpense: number
  remarks: string
  status: string
}

const initialSurveyRoutes: SurveyRoute[] = [
  {
    id: 1,
    title: "Raipur To Bilaspur",
    date: "19 Jan 2026",
    expenses: [
      { id: 1, category: "Fuel", amount: "₹ 1000" },
      { id: 2, category: "Food", amount: "₹ 300" },
      { id: 3, category: "Hotel", amount: "₹ 500" },
    ],
    totalExpense: 1800,
    remarks: "You Are About To Cancel This Order. This Action Is Permanent And May Update Inventory And Payment Records.",
    status: "Approved",
  },
  {
    id: 2,
    title: "Raipur To Bilaspur",
    date: "19 Jan 2026",
    expenses: [],
    totalExpense: 0,
    remarks: "",
    status: "Pending",
  },
]

export default function SurveyExpensesPage() {
  const [surveyRoutes, setSurveyRoutes] = useState<SurveyRoute[]>(initialSurveyRoutes)
  const [expandedRoutes, setExpandedRoutes] = useState<number[]>([1])

  const toggleRoute = (id: number) => {
    setExpandedRoutes((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const updateRouteRemarks = (routeId: number, remarks: string, totalExpense: number, status: string) => {
    setSurveyRoutes(prev => prev.map(route =>
      route.id === routeId
        ? { ...route, remarks, totalExpense, status }
        : route
    ))
  }

  return (
    <DashboardLayout>
      <div className=" min-h-screen space-y-6">

        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[20px] font-bold ">
            ASM : Kabir Nag <span className="text-[#44444A] pl-1 text-sm">#151056</span>
          </h2>

          <div className="flex gap-3">
            <select
             className="px-4 py-2 border rounded-lg text-sm bg-[#F87B1B1A] text-[#F87B1B] font-semibold">
              <option>District</option>
            </select>
            <select className=" bg-[#F87B1B1A] text-[#F87B1B] px-4 py-2 border rounded-lg text-sm">
              <option>1 Month</option>
            </select>
            <Button className="bg-[#D9F0E3] text-[#009846] hover:bg-[#c8efd9]">
              <Download  className="w-4 h-4 " />
              Export
            </Button>
          </div>
        </div>

        {/* Routes */}
        <div className="space-y-4">
          {surveyRoutes.map((route) => (
            <div key={route.id} className="space-y-2">
              {/* Route Header */}
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-[#F87B1B1A] rounded-lg px-3 py-2 flex items-center justify-between">
                  <div >
                    <h3 className="text-md font-semibold text-[#F87B1B]">
                      {route.title}
                    </h3>
                    <p className="text-sm py-1 ">{route.date}</p>
                  </div>

                  <button
                    onClick={() => toggleRoute(route.id)}
                    className="text-[#F87B1B] hover:opacity-80"
                  >
                    {expandedRoutes.includes(route.id) ? (
                      <Minus className="w-6 h-6" />
                    ) : (
                      <Plus className="w-6 h-6" />
                    )}
                  </button>
                </div>

                <ExpenseRemarkDrawer
                  routeId={route.id}
                  routeTitle={route.title}
                  currentRemarks={route.remarks}
                  currentTotalExpense={route.totalExpense}
                  currentStatus={route.status}
                  onUpdateRemarks={updateRouteRemarks}
                />
              </div>

              {/* Expanded Content */}
              {expandedRoutes.includes(route.id) && (
                <div className="bg-white rounded-lg border p-5 w-[87%]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>S No.</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Image</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {route.expenses.map((exp, index) => (
                        <TableRow key={exp.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{exp.category}</TableCell>
                          <TableCell className="font-semibold">
                            {exp.amount}
                          </TableCell>
                          <TableCell>
                            <div className="w-12 h-12 bg-gray-300 rounded-md" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="text-sm text-gray-500 pt-4">
                    Total Expense : <span className="font-semibold">₹ {route.totalExpense}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
