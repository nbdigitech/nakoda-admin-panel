"use client"

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AnalyticsChartProps {
  title: string
  value: string
  subtitle: string
  chartType: "revenue" | "orders"
}

const revenueData = [
  { name: "Mon", value: 4000 },
  { name: "Tue", value: 3000 },
  { name: "Wed", value: 2000 },
  { name: "Thu", value: 2780 },
  { name: "Fri", value: 1890 },
  { name: "Sat", value: 2390 },
  { name: "Sun", value: 3490 },
]

const ordersData = [
  { name: "Mon", value: 245 },
  { name: "Tue", value: 320 },
  { name: "Wed", value: 280 },
  { name: "Thu", value: 290 },
  { name: "Fri", value: 340 },
  { name: "Sat", value: 310 },
  { name: "Sun", value: 380 },
]

export default function AnalyticsChart({
  title,
  value,
  subtitle,
  chartType,
}: AnalyticsChartProps) {
  const data = chartType === "revenue" ? revenueData : ordersData
  const isRevenue = chartType === "revenue"

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">{subtitle}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>

        <Select defaultValue="week">
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Select Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ===== Chart ===== */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {isRevenue ? (
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F87B1B" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F87B1B" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#F87B1B"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="value" fill="#F87B1B" radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* ===== Footer Stats ===== */}
      <div className="flex gap-6 mt-6 pt-6 border-t">
        <div>
          <p className="text-sm text-gray-500 mb-1">Average</p>
          <p className="text-lg font-bold text-gray-900">
            {isRevenue ? "$2,850" : "312"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Growth</p>
          <p className="text-lg font-bold text-green-600">+12.5%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Peak</p>
          <p className="text-lg font-bold text-gray-900">
            {isRevenue ? "$4,000" : "380"}
          </p>
        </div>
      </div>
    </div>
  )
}
