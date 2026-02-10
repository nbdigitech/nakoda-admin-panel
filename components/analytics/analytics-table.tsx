"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TrendingUp, TrendingDown } from "lucide-react"

interface AnalyticsData {
  id: number
  metric: string
  value: string
  change: string
  trend: "up" | "down"
  percentage: string
}

interface AnalyticsTableProps {
  data: AnalyticsData[]
}

export default function AnalyticsTable({ data }: AnalyticsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 hover:bg-transparent">
            <TableHead className="text-gray-600 font-semibold text-sm">Metric</TableHead>
            <TableHead className="text-gray-600 font-semibold text-sm text-right">Value</TableHead>
            <TableHead className="text-gray-600 font-semibold text-sm text-right">Change</TableHead>
            <TableHead className="text-gray-600 font-semibold text-sm text-right">Trend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={row.id}
              className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                index === data.length - 1 ? "border-b-0" : ""
              }`}
            >
              <TableCell className="py-4">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{row.metric}</p>
                </div>
              </TableCell>
              <TableCell className="py-4 text-right">
                <p className="font-bold text-gray-900 text-sm">{row.value}</p>
              </TableCell>
              <TableCell className="py-4 text-right">
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold inline-flex items-center gap-1 ${
                    row.trend === "up"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {row.trend === "up" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {row.change}
                </span>
              </TableCell>
              <TableCell className="py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        row.trend === "up" ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{ width: `${row.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 w-12 text-right">
                    {row.percentage}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
