"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function DashboardCards({ data }: { data?: any }) {
  const stats = [
    {
      title: "Total Dealer",
      value: data?.totalDealer?.toLocaleString() || "0",
      image: "/total dealer.png",
      bg: "bg-orange-100",
    },
    {
      title: "Total Sub Dealer",
      value: data?.totalInfluencer?.toLocaleString() || "0",
      image: "/total sub dealer.png",
      bg: "bg-orange-100",
    },
    {
      title: "Total Staff",
      value: data?.totalStaff?.toLocaleString() || "0",
      image: "/total staff.png",
      bg: "bg-orange-100",
    },
    {
      title: "Total Order",
      value: data?.totalDealerOrder?.toLocaleString() || "0",
      image: "/total order.png",
      bg: "bg-green-100",
    },
    {
      title: "Today Order",
      value: data?.todayOrders?.toLocaleString() || "0",
      image: "/total order.png",
      bg: "bg-green-100",
    },
    {
      title: "Order Pending",
      value: data?.pendingOrders?.toLocaleString() || "0",
      image: "/total order.png",
      bg: "bg-green-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((item) => (
        <Card
          key={item.title}
          className="rounded-xl border border-gray-100 shadow-sm"
        >
          <CardContent
            className="
              flex items-center gap-4 
              px-5 py-4 
              min-h-[92px]   /* ✅ FIXED HEIGHT */
            "
          >
            {/* Icon */}
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-lg ${item.bg}`}
            >
              <Image
                src={item.image}
                alt={item.title}
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </div>

            {/* Text */}
            <div className="flex flex-col justify-center">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {item.title}
              </span>
              <span className="text-xl font-bold text-gray-900 leading-tight">
                {item.value}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
