"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip, // ✅ added
} from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const data = [
  { day: "Sun", value: 1500 },
  { day: "Mon", value: 1900 },
  { day: "Tue", value: 1650 },
  { day: "Wed", value: 1800 },
  { day: "Thu", value: 950 },
  { day: "Fri", value: 1350 },
]

export default function OrderChart() {
  const defaultValue = data[data.length - 1].value

  const [activeValue, setActiveValue] = useState<number>(defaultValue)
  const [activeDay, setActiveDay] = useState<string>("")

  return (
    <div className="bg-white rounded-xl p-3 shadow w-full h-full">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-md font-semibold">Rate</p>
          <h3 className="text-[20px] font-bold text-gray-900">
            {activeValue}
          </h3>
          {activeDay && (
            <p className="text-xs text-gray-400">({activeDay})</p>
          )}
        </div>

        <div className="flex gap-3 items-center">
          <div className="flex items-center text-[12px] font-bold text-[#0A8F3E]">
            ₹ 150 <span className="ml-1">▲</span>
          </div>

          <Select defaultValue="week">
            <SelectTrigger className="w-[120px] h-8 text-sm font-medium bg-[#F87B1B1A] border-none rounded-md">
              <SelectValue placeholder="Last Week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ===== Chart ===== */}
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
            onMouseMove={(state: any) => {
              if (state?.activePayload?.length) {
                setActiveValue(state.activePayload[0].payload.value)
                setActiveDay(state.activePayload[0].payload.day)
              }
            }}
            onMouseLeave={() => {
              setActiveValue(defaultValue)
              setActiveDay("")
            }}
          >
            {/* ✅ GRID */}
            <CartesianGrid
              strokeDasharray="3 6"
              vertical={false}
              stroke="#E5E7EB"
            />

            {/* ✅ HOVER VERTICAL LINE */}
            <Tooltip
              cursor={{
                stroke: "#F87B1B",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              content={() => null} // hides tooltip box
            />

            {/* ===== Gradients ===== */}
            <defs>
              <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F87B1B" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#F87B1B" stopOpacity={0.05} />
              </linearGradient>

              <pattern
                id="stripePattern"
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="6"
                  stroke="#F87B1B"
                  strokeOpacity={0.25}
                  strokeWidth={1}
                />
              </pattern>
            </defs>

            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#F87B1B"
              strokeWidth={2.5}
              fill="url(#fillGradient)"
              activeDot={{
                r: 6,
                fill: "#F87B1B",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />

            {/* Stripe overlay */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill="url(#stripePattern)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
