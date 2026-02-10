"use client"

import Link from "next/link"
import { Search, Bell, Mail, User } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()

  const getPageName = () => {
    if (pathname.startsWith("/notifications")) return "Notifications"
    if (pathname.startsWith("/emails")) return "Emails"
    if (pathname.startsWith("/manage-order")) return "Manage Order"
    if (pathname.startsWith("/dealer")) return "Manage Dealer"
    if (pathname.startsWith("/sub-dealer")) return "Manage Sub Dealer"
    if (pathname.startsWith("/staff")) return "Manage Staff"
    if (pathname.startsWith("/permission")) return "Manage Permission"
    if (pathname.startsWith("/analytics")) return "Analytics"
    if (pathname.startsWith("/chatbot")) return "AI Chat Bot"
    if (pathname.startsWith("/master")) return "Master "
    if (pathname.startsWith("/rewards")) return "Rewards"
    if (pathname.startsWith("/order-history")) return "Order History"
    if (pathname.startsWith("/dashboard")) return "Dashboard"
    return "Dashboard"
  }

  return (
    <header className="bg-[#FFFFFF] border-b border-gray-200 sticky top-0 z-20">
      <div className="h-20 flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {getPageName()}
        </h1>

        {/* Page Title */}

        {/* Search */}
       <div className="flex justify-between">

        <div className="hidden sm:flex relative bg-[#F3F5FA] w-72 mr-6">
          <input
            type="text"
            placeholder="Search here"
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F87B1B]"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5">
          <Link href="/notifications" className="bg-[#F3F5FA] p-2 rounded-lg hover:bg-orange-100 transition">
            <Bell className="w-5 h-5 text-gray-300 hover:text-[#F87B1B]" />
          </Link>
          <Link href="/emails" className="bg-[#F3F5FA] p-2 rounded-lg hover:bg-orange-100 transition">
            <Mail className="w-5 h-5 text-gray-300 hover:text-[#F87B1B]" />
          </Link>
          <div className="w-9 h-9 rounded-full bg-[#F87B1B] flex items-center justify-center text-white">
            <User className="w-4 h-4" />
          </div>
        </div>
        </div>
      </div>
    </header>
  )
}