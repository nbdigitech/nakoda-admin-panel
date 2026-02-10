"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, BarChart3 } from "lucide-react"

interface AnalyticsCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ReactNode
  bgColor: string
}

const AnalyticsCardComponent = ({
  title,
  value,
  change,
  trend,
  icon,
  bgColor,
}: AnalyticsCardProps) => {
  const trendColor = trend === "up" ? "text-green-600" : "text-red-600"
  const trendBg = trend === "up" ? "bg-green-50" : "bg-red-50"

  return (
    <Card className="rounded-xl">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          </div>
          <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${bgColor}`}>
            {icon}
          </div>
        </div>
        <div className={`flex items-center gap-1 ${trendBg} px-3 py-1 rounded-lg w-fit`}>
          {trend === "up" ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span className={`text-sm font-semibold ${trendColor}`}>{change}</span>
        </div>
      </CardContent>
    </Card>
  )
}

const analyticsCards = [
  {
    title: "Total Revenue",
    value: "$45,678",
    change: "+12.5%",
    trend: "up" as const,
    icon: <DollarSign className="w-6 h-6 text-orange-600" />,
    bgColor: "bg-orange-100",
  },
  {
    title: "Total Sales",
    value: "1,234",
    change: "+8.2%",
    trend: "up" as const,
    icon: <ShoppingCart className="w-6 h-6 text-blue-600" />,
    bgColor: "bg-blue-100",
  },
  {
    title: "Active Dealers",
    value: "502",
    change: "+5.3%",
    trend: "up" as const,
    icon: <Users className="w-6 h-6 text-green-600" />,
    bgColor: "bg-green-100",
  },
  {
    title: "Performance",
    value: "87.5%",
    change: "-2.1%",
    trend: "down" as const,
    icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
    bgColor: "bg-purple-100",
  },
]

export default function AnalyticsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {analyticsCards.map((card) => (
        <AnalyticsCardComponent
          key={card.title}
          title={card.title}
          value={card.value}
          change={card.change}
          trend={card.trend}
          icon={card.icon}
          bgColor={card.bgColor}
        />
      ))}
    </div>
  )
}
