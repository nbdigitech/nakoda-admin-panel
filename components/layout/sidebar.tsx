"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  UserPlus,
  ShieldCheck,
  Package,
  History,
  Bot,
  Database,
  Trophy,
  LogOut,
  ChevronDown,
  Bell,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/firebase";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const dashboardDropdownItems: SidebarItem[] = [
  // { label: "Analytics", href: "/analytics", icon: <BarChart3 size={16} /> },
  { label: "Dealer", href: "/dealer", icon: <Users size={16} /> },
  { label: "Sub Dealer", href: "/sub-dealer", icon: <UserPlus size={16} /> },
  { label: "Staff", href: "/staff", icon: <Users size={16} /> },
  // { label: "Permission", href: "/permission", icon: <ShieldCheck size={16} /> },
];

const managementItems: SidebarItem[] = [
  { label: "Manage Order", href: "/manage-order", icon: <Package size={16} /> },
  {
    label: "Order History",
    href: "/order-history",
    icon: <History size={16} />,
  },
  { label: "ASM Survey", href: "/asm-survey", icon: <Users size={16} /> },
  { label: "AI Chat Bot", href: "/chatbot", icon: <Bot size={16} /> },
  { label: "Master", href: "/master", icon: <Database size={16} /> },
  // { label: "Rewards", href: "/rewards", icon: <Trophy size={16} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [dashboardOpen, setDashboardOpen] = React.useState(true);

  const handleLogout = async () => {
    try {
      await signOut(getFirebaseAuth());
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const isDashboardActive =
    pathname === "/dashboard" ||
    dashboardDropdownItems.some((item) => pathname.startsWith(item.href));

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r">
      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b px-2">
        <Image
          src="/images/nakoda-20logo-20hindi-20and-20english.svg"
          alt="Nakoda TMT Logo"
          width={215}
          height={60}
          priority
        />
      </div>

      {/* New Dealer */}

      <ScrollArea className=" mt-4 h-[calc(100vh-160px)] px-3">
        {/* Dashboard */}
        <Collapsible open={dashboardOpen} onOpenChange={setDashboardOpen}>
          <CollapsibleTrigger asChild>
            <div
              className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer ${
                isDashboardActive
                  ? "bg-orange-50 text-[#F87B1B]"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <ChevronDown
                size={16}
                className={`transition ${dashboardOpen ? "rotate-180" : ""}`}
              />
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="ml-4 mt-2 space-y-1 border-l pl-3">
            {dashboardDropdownItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                  pathname.startsWith(item.href)
                    ? "text-[#F87B1B]"
                    : "text-gray-400 hover:text-[#F87B1B]"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Management */}
        <div className="mt-4 space-y-2">
          {/* Manage Order Dropdown */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer ${
                  pathname.startsWith("/manage-order")
                    ? "bg-orange-50 text-[#F87B1B]"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Package size={18} />
                  Manage Order
                </div>
                <ChevronDown size={16} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-4 mt-2 space-y-1 border-l pl-3">
              <Link
                href="/manage-order/dealer"
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                  pathname === "/manage-order/dealer"
                    ? "text-[#F87B1B]"
                    : "text-gray-400 hover:text-[#F87B1B]"
                }`}
              >
                <Users size={16} />
                Dealer
              </Link>
              <Link
                href="/manage-order/sub-dealer"
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                  pathname === "/manage-order/sub-dealer"
                    ? "text-[#F87B1B]"
                    : "text-gray-400 hover:text-[#F87B1B]"
                }`}
              >
                <UserPlus size={16} />
                Sub Dealer
              </Link>
            </CollapsibleContent>
          </Collapsible>

          {managementItems
            .filter((item) => item.label !== "Manage Order")
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                  pathname.startsWith(item.href)
                    ? "bg-orange-50 text-[#F87B1B]"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="gap-2 flex justify-start w-full text-[#F87B1B] hover:bg-orange-50"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </ScrollArea>
    </aside>
  );
}
