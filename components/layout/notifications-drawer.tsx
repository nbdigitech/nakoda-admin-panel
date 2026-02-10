"use client"

import { useState } from "react"
import Link from "next/link"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Mail, Trash2, Eye, EyeOff, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: number
  title: string
  message: string
  timestamp: string
  read: boolean
  type: "order" | "dealer" | "system" | "alert"
}

interface NotificationsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const notificationsList: Notification[] = [
  {
    id: 1,
    title: "New Order Received",
    message: "Order #151089 has been received from Kabir Nag",
    timestamp: "5 minutes ago",
    read: false,
    type: "order",
  },
  {
    id: 2,
    title: "Dealer Registration",
    message: "New dealer Bharat Sahu has been approved",
    timestamp: "2 hours ago",
    read: false,
    type: "dealer",
  },
  {
    id: 3,
    title: "Payment Received",
    message: "Payment of $12,500 received for order #151056",
    timestamp: "4 hours ago",
    read: true,
    type: "order",
  },
  {
    id: 4,
    title: "System Update",
    message: "System maintenance scheduled for tonight",
    timestamp: "1 day ago",
    read: true,
    type: "system",
  },
  {
    id: 5,
    title: "Alert: Low Stock",
    message: "Stock level is below minimum threshold",
    timestamp: "2 days ago",
    read: true,
    type: "alert",
  },
]

const getTypeColor = (type: string) => {
  switch (type) {
    case "order":
      return "bg-blue-100 text-blue-700"
    case "dealer":
      return "bg-green-100 text-green-700"
    case "system":
      return "bg-purple-100 text-purple-700"
    case "alert":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function NotificationsDrawer({
  open,
  onOpenChange,
}: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState(notificationsList)

  const unreadCount = notifications.filter((n) => !n.read).length

  const toggleRead = (id: number) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: !notif.read } : notif
      )
    )
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((notif) => notif.id !== id))
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="flex justify-between items-center border-b px-6 py-4">
          <div>
            <DrawerTitle className="text-2xl font-bold">Notifications</DrawerTitle>
            <p className="text-sm text-gray-500 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/notifications">
            <Button className="bg-[#F87B1B] text-white hover:bg-[#e06a0a]">
              View All
            </Button>
          </Link>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-3 py-4">
            {notifications.slice(0, 5).map((notification) => (
              <Card key={notification.id} className="rounded-lg">
                <CardContent className={`p-4 ${!notification.read ? "bg-orange-50" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-1">
                        <div
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${getTypeColor(
                            notification.type
                          )}`}
                        >
                          {notification.type.charAt(0).toUpperCase() +
                            notification.type.slice(1)}
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-0.5">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                      <p className="text-xs text-gray-400">{notification.timestamp}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleRead(notification.id)}
                        className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-[#F87B1B]"
                      >
                        {notification.read ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}
