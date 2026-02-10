"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import AnalyticsCards from "@/components/analytics/analytics-cards"
import { Button } from "@/components/ui/button"
import AnalyticsChart from "@/components/analytics/analytics-chart"
import { Users, Building2, BarChart3 } from "lucide-react"
import DetailedMetricsTable from "@/components/analytics/detailed-metrics-table"

const filterOptions = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"]
const viewOptions = ["Dealer", "SubDealer", "Staff"]

export default function AnalyticsPage() {
  const [activeFilter, setActiveFilter] = useState("Monthly")
  const [activeView, setActiveView] = useState("Dealer")

  return (
    <DashboardLayout>
      {/* ================= PAGE HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-500">Track and analyze your business metrics</p>
      </div>

      {/* ================= FILTER BUTTONS ================= */}
      <div className="flex gap-3 mb-8 overflow-x-auto">
        {filterOptions.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition
              ${
                activeFilter === filter
                  ? "bg-[#F87B1B] text-white"
                  : "bg-orange-50 text-[#F87B1B] hover:bg-orange-100"
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* ================= ANALYTICS CARDS ================= */}
      <div className="mb-8">
        <AnalyticsCards />
      </div>

      {/* ================= VIEW SELECTOR ================= */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Analytics Overview</h2>
          <div className="flex gap-3">
            {viewOptions.map((option) => (
              <button
                key={option}
                onClick={() => setActiveView(option)}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition ${
                  activeView === option
                    ? "bg-[#F87B1B] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Dealer View */}
        {activeView === "Dealer" && (
          <div className="space-y-6">
            {/* Dealer Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Dealers</p>
                    <h3 className="text-3xl font-bold text-gray-900">456</h3>
                    <p className="text-xs text-green-600 mt-2">+8.5% from last month</p>
                  </div>
                  <div className="bg-blue-200 p-3 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Dealers</p>
                    <h3 className="text-3xl font-bold text-gray-900">502</h3>
                    <p className="text-xs text-green-600 mt-2">+5.2% from last month</p>
                  </div>
                  <div className="bg-green-200 p-3 rounded-lg">
                    <Building2 className="w-6 h-6 text-green-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                    <h3 className="text-3xl font-bold text-gray-900">3,245</h3>
                    <p className="text-xs text-green-600 mt-2">+22.5% from last month</p>
                  </div>
                  <div className="bg-purple-200 p-3 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Dealer Revenue</p>
                    <h3 className="text-3xl font-bold text-gray-900">$567,890</h3>
                    <p className="text-xs text-green-600 mt-2">+18.3% from last month</p>
                  </div>
                  <div className="bg-orange-200 p-3 rounded-lg">
                    <Building2 className="w-6 h-6 text-orange-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Dealer Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart
                title="Dealer Orders Trend"
                value="3,245"
                subtitle="Total Dealer Orders"
                chartType="orders"
              />
              <AnalyticsChart
                title="Dealer Revenue Trend"
                value="$567,890"
                subtitle="Total Dealer Revenue"
                chartType="revenue"
              />
            </div>

            {/* Dealer Details Table */}
            <DetailedMetricsTable
              type="dealers"
              title="Dealer Details & Orders"
            />
          </div>
        )}

        {/* SubDealer View */}
        {activeView === "SubDealer" && (
          <div className="space-y-6">
            {/* SubDealer Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active SubDealers</p>
                    <h3 className="text-3xl font-bold text-gray-900">2,456</h3>
                    <p className="text-xs text-green-600 mt-2">+12.5% from last month</p>
                  </div>
                  <div className="bg-indigo-200 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-indigo-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total SubDealers</p>
                    <h3 className="text-3xl font-bold text-gray-900">2,502</h3>
                    <p className="text-xs text-green-600 mt-2">+10.3% from last month</p>
                  </div>
                  <div className="bg-cyan-200 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-cyan-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">SubDealer Orders</p>
                    <h3 className="text-3xl font-bold text-gray-900">8,945</h3>
                    <p className="text-xs text-green-600 mt-2">+28.3% from last month</p>
                  </div>
                  <div className="bg-teal-200 p-3 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-teal-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">SubDealer Revenue</p>
                    <h3 className="text-3xl font-bold text-gray-900">$234,567</h3>
                    <p className="text-xs text-green-600 mt-2">+18.7% from last month</p>
                  </div>
                  <div className="bg-rose-200 p-3 rounded-lg">
                    <Building2 className="w-6 h-6 text-rose-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* SubDealer Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart
                title="SubDealer Orders Trend"
                value="8,945"
                subtitle="Total SubDealer Orders"
                chartType="orders"
              />
              <AnalyticsChart
                title="SubDealer Revenue Trend"
                value="$234,567"
                subtitle="Total SubDealer Revenue"
                chartType="revenue"
              />
            </div>

            {/* SubDealer Details Table */}
            <DetailedMetricsTable
              type="subDealers"
              title="SubDealer Information & Orders"
            />
          </div>
        )}

        {/* Staff View */}
        {activeView === "Staff" && (
          <div className="space-y-6">
            {/* Staff Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Staff</p>
                    <h3 className="text-3xl font-bold text-gray-900">542</h3>
                    <p className="text-xs text-green-600 mt-2">+5.2% from last month</p>
                  </div>
                  <div className="bg-amber-200 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-amber-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-lime-50 to-lime-100 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Staff</p>
                    <h3 className="text-3xl font-bold text-gray-900">487</h3>
                    <p className="text-xs text-green-600 mt-2">89.9% active</p>
                  </div>
                  <div className="bg-lime-200 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-lime-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Orders Processed</p>
                    <h3 className="text-3xl font-bold text-gray-900">5,234</h3>
                    <p className="text-xs text-green-600 mt-2">+15.6% from last month</p>
                  </div>
                  <div className="bg-sky-200 p-3 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-sky-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Staff Productivity</p>
                    <h3 className="text-3xl font-bold text-gray-900">92.5%</h3>
                    <p className="text-xs text-green-600 mt-2">+3.1% from last month</p>
                  </div>
                  <div className="bg-fuchsia-200 p-3 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-fuchsia-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart
                title="Staff Performance Trend"
                value="92.5%"
                subtitle="Staff Productivity Rate"
                chartType="revenue"
              />
              <AnalyticsChart
                title="Orders Processed Trend"
                value="5,234"
                subtitle="Orders Processed by Staff"
                chartType="orders"
              />
            </div>

            {/* Staff Details Table */}
            <DetailedMetricsTable
              type="staff"
              title="Staff Performance Details"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
