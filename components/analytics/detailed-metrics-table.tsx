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

interface DetailedMetricsTableProps {
  type: "dealers" | "subDealers" | "staff" | "performance"
  title: string
}

const dealersData = [
  {
    id: 1,
    name: "Kabir Nag",
    location: "Sankar Nagar Raipur",
    orders: 345,
    revenue: "$65,789",
    avgOrderValue: "$190.68",
    growthRate: "+15.5%",
    trend: "up",
  },
  {
    id: 2,
    name: "Bharat Sahu",
    location: "Dhanwantri Square",
    orders: 287,
    revenue: "$54,234",
    avgOrderValue: "$189.01",
    growthRate: "+12.3%",
    trend: "up",
  },
  {
    id: 3,
    name: "Bhuvan Raj",
    location: "Old Market Area",
    orders: 256,
    revenue: "$48,567",
    avgOrderValue: "$189.67",
    growthRate: "+9.8%",
    trend: "up",
  },
  {
    id: 4,
    name: "Rajesh Sharma",
    location: "Pune Road",
    orders: 234,
    revenue: "$44,345",
    avgOrderValue: "$189.45",
    growthRate: "+7.5%",
    trend: "up",
  },
  {
    id: 5,
    name: "Priya Singh",
    location: "City Center",
    orders: 178,
    revenue: "$33,789",
    avgOrderValue: "$189.83",
    growthRate: "+4.2%",
    trend: "up",
  },
]

const subDealersData = [
  {
    id: 1,
    name: "Raj SubDealers Ltd",
    orders: 245,
    revenue: "$45,678",
    avgOrderValue: "$186.45",
    growthRate: "+12.5%",
    trend: "up",
  },
  {
    id: 2,
    name: "Metro SubDealers",
    orders: 189,
    revenue: "$38,456",
    avgOrderValue: "$203.45",
    growthRate: "+8.2%",
    trend: "up",
  },
  {
    id: 3,
    name: "Premium Trading",
    orders: 156,
    revenue: "$32,789",
    avgOrderValue: "$210.18",
    growthRate: "+5.6%",
    trend: "up",
  },
  {
    id: 4,
    name: "Global Commerce",
    orders: 142,
    revenue: "$29,567",
    avgOrderValue: "$208.22",
    growthRate: "+3.2%",
    trend: "up",
  },
  {
    id: 5,
    name: "Fast Track Sales",
    orders: 128,
    revenue: "$26,234",
    avgOrderValue: "$204.95",
    growthRate: "-1.5%",
    trend: "down",
  },
]

const staffData = [
  {
    id: 1,
    name: "Rajesh Kumar",
    department: "Sales",
    ordersProcessed: 234,
    revenue: "$45,678",
    performance: "95.2%",
    growthRate: "+8.5%",
    trend: "up",
  },
  {
    id: 2,
    name: "Priya Singh",
    department: "Operations",
    ordersProcessed: 198,
    revenue: "$38,456",
    performance: "92.8%",
    growthRate: "+5.2%",
    trend: "up",
  },
  {
    id: 3,
    name: "Amit Patel",
    department: "Logistics",
    ordersProcessed: 176,
    revenue: "$32,789",
    performance: "90.1%",
    growthRate: "+3.8%",
    trend: "up",
  },
  {
    id: 4,
    name: "Sneha Gupta",
    department: "Customer Service",
    ordersProcessed: 154,
    revenue: "$29,567",
    performance: "88.5%",
    growthRate: "+2.1%",
    trend: "up",
  },
  {
    id: 5,
    name: "Vikram Sharma",
    department: "Sales",
    ordersProcessed: 132,
    revenue: "$26,234",
    performance: "85.3%",
    growthRate: "-0.8%",
    trend: "down",
  },
]

const performanceData = [
  {
    id: 1,
    metric: "Total Orders",
    value: "11,234",
    target: "12,000",
    completion: "93.6%",
    trend: "up",
  },
  {
    id: 2,
    metric: "Total Revenue",
    value: "$802,456",
    target: "$850,000",
    completion: "94.4%",
    trend: "up",
  },
  {
    id: 3,
    metric: "Order Fulfillment",
    value: "94.3%",
    target: "95.0%",
    completion: "99.3%",
    trend: "up",
  },
  {
    id: 4,
    metric: "Customer Satisfaction",
    value: "4.8/5.0",
    target: "4.7/5.0",
    completion: "102.1%",
    trend: "up",
  },
  {
    id: 5,
    metric: "Dealer Retention",
    value: "96.2%",
    target: "95.0%",
    completion: "101.3%",
    trend: "up",
  },
  {
    id: 6,
    metric: "Staff Productivity",
    value: "92.5%",
    target: "90.0%",
    completion: "102.8%",
    trend: "up",
  },
]

export default function DetailedMetricsTable({
  type,
  title,
}: DetailedMetricsTableProps) {
  const data = type === "dealers" ? dealersData : type === "subDealers" ? subDealersData : type === "staff" ? staffData : performanceData

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 hover:bg-transparent">
              {type === "dealers" && (
                <>
                  <TableHead className="text-gray-600 font-semibold text-sm">
                    Dealer Name
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm">
                    Location
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Orders
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Revenue
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Avg Order Value
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Growth Rate
                  </TableHead>
                </>
              )}
              {type === "subDealers" && (
                <>
                  <TableHead className="text-gray-600 font-semibold text-sm">
                    SubDealer Name
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Orders
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Revenue
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Avg Order Value
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Growth Rate
                  </TableHead>
                </>
              )}
              {type === "staff" && (
                <>
                  <TableHead className="text-gray-600 font-semibold text-sm">
                    Staff Name
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm">
                    Department
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Orders Processed
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Revenue
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Performance
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Growth
                  </TableHead>
                </>
              )}
              {type === "performance" && (
                <>
                  <TableHead className="text-gray-600 font-semibold text-sm">
                    Metric
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Current Value
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Target
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Completion %
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Status
                  </TableHead>
                </>
              )}
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
                {type === "dealers" && (
                  <>
                    <TableCell className="py-4">
                      <p className="font-semibold text-gray-900 text-sm">
                        {(row as any).name}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-gray-600 text-sm">
                        {(row as any).location}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        {(row as any).orders}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        {(row as any).revenue}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <p className="font-semibold text-gray-900 text-sm">
                        {(row as any).avgOrderValue}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-semibold inline-flex items-center gap-1 ${
                          (row as any).trend === "up"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {(row as any).trend === "up" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {(row as any).growthRate}
                      </span>
                    </TableCell>
                  </>
                )}
                {type === "subDealers" && (
                  <>
                    <TableCell className="py-4">
                      <p className="font-semibold text-gray-900 text-sm">
                        {(row as any).name}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        {(row as any).orders}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        {(row as any).revenue}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <p className="font-semibold text-gray-900 text-sm">
                        {(row as any).avgOrderValue}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-semibold inline-flex items-center gap-1 ${
                          (row as any).trend === "up"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {(row as any).trend === "up" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {(row as any).growthRate}
                      </span>
                    </TableCell>
                  </>
                )}
                {type === "staff" && (
                  <>
                    <TableCell className="py-4">
                      <p className="font-semibold text-gray-900 text-sm">
                        {(row as any).name}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="px-3 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-semibold">
                        {(row as any).department}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        {(row as any).ordersProcessed}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        {(row as any).revenue}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <p className="font-semibold text-gray-900 text-sm">
                        {(row as any).performance}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-semibold inline-flex items-center gap-1 ${
                          (row as any).trend === "up"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {(row as any).trend === "up" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {(row as any).growthRate}
                      </span>
                    </TableCell>
                  </>
                )}
                {type === "performance" && (
                  <>
                    <TableCell className="py-4">
                      <p className="font-semibold text-gray-900 text-sm">
                        {(row as any).metric}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        {(row as any).value}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <p className="font-semibold text-gray-600 text-sm">
                        {(row as any).target}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-[#F87B1B]"
                            style={{
                              width: `${Math.min(
                                parseInt((row as any).completion),
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-600 w-12 text-right">
                          {(row as any).completion}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-semibold inline-flex items-center gap-1 ${
                          (row as any).trend === "up"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {(row as any).trend === "up" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        On Track
                      </span>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
