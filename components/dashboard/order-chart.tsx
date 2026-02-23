"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getFirestoreDB } from "@/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function OrderChart() {
  const [filter, setFilter] = useState("week");
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirestoreDB();
    if (!db) return;

    let limitCount = 7;
    if (filter === "month") limitCount = 30;
    if (filter === "year") limitCount = 365;

    const q = query(
      collection(db, "daily_price"),
      orderBy("date", "desc"),
      limit(limitCount),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedData = snapshot.docs
          .map((doc) => {
            const d = doc.data();
            const dateObj = d.date ? new Date(d.date) : new Date();
            let dayStr = "";
            if (filter === "week") {
              dayStr = format(dateObj, "EEE");
            } else if (filter === "month") {
              dayStr = format(dateObj, "dd MMM");
            } else {
              dayStr = format(dateObj, "MMM yy");
            }

            return {
              day: dayStr,
              value: Number(d.newPrice) || 0,
              originalDate: d.date,
              oldPrice: Number(d.oldPrice) || 0,
            };
          })
          .reverse();

        setChartData(fetchedData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching chart data:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [filter]);

  const latestData =
    chartData.length > 0 ? chartData[chartData.length - 1] : null;
  const displayValue =
    hoveredValue !== null ? hoveredValue : latestData?.value || 0;
  const displayDay = hoveredDay !== null ? hoveredDay : latestData?.day || "";

  let diff = 0;
  let isUp = true;
  if (chartData.length >= 2) {
    const latest = chartData[chartData.length - 1].value;
    const previous = chartData[chartData.length - 2].value;
    diff = latest - previous;
    isUp = diff >= 0;
  } else if (latestData) {
    diff = latestData.value - latestData.oldPrice;
    isUp = diff >= 0;
  }

  return (
    <div className="bg-white rounded-xl p-3 shadow w-full h-full flex flex-col">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-md font-semibold">Rate</p>
          <div className="flex items-end gap-2">
            <h3 className="text-[20px] font-bold text-gray-900">
              {displayValue ? displayValue.toLocaleString() : "0"}
            </h3>
            {displayDay && (
              <p className="text-xs text-gray-400 mb-[4px]">({displayDay})</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 items-center">
          {chartData.length > 0 && (
            <div
              className={`flex items-center justify-center text-[12px] font-bold ${isUp ? "text-[#0A8F3E]" : "text-red-500"}`}
            >
              ₹ {Math.abs(diff)}{" "}
              <span className="ml-1">{isUp ? "▲" : "▼"}</span>
            </div>
          )}

          <Select value={filter} onValueChange={setFilter}>
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
      <div className="flex-1 min-h-[220px]">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center min-h-[220px]">
            <Loader2 className="w-6 h-6 animate-spin text-[#F87B1B]" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm min-h-[220px]">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
              onMouseMove={(state: any) => {
                if (state?.activePayload?.length) {
                  setHoveredValue(state.activePayload[0].payload.value);
                  setHoveredDay(state.activePayload[0].payload.day);
                }
              }}
              onMouseLeave={() => {
                setHoveredValue(null);
                setHoveredDay(null);
              }}
            >
              <CartesianGrid
                strokeDasharray="3 6"
                vertical={false}
                stroke="#E5E7EB"
              />

              <Tooltip
                cursor={{
                  stroke: "#F87B1B",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                content={() => null}
              />

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
                domain={["auto", "auto"]}
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

              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill="url(#stripePattern)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
