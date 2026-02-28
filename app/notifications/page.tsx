"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Trash2, Eye, EyeOff } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "order" | "dealer" | "system" | "alert";
}

const notificationsList: Notification[] = [
  {
    id: 1,
    title: "New Order Received",
    message: "Order #151089 has been received from Kabir Nag for 550t shipment",
    timestamp: "5 minutes ago",
    read: false,
    type: "order",
  },
  {
    id: 2,
    title: "Dealer Registration",
    message:
      "New dealer registration completed. Bharat Sahu has been approved.",
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
    message: "System maintenance scheduled for tonight at 11:00 PM",
    timestamp: "1 day ago",
    read: true,
    type: "system",
  },
  {
    id: 5,
    title: "Alert: Low Stock",
    message: "Stock level for Product A is below minimum threshold",
    timestamp: "2 days ago",
    read: true,
    type: "alert",
  },
  {
    id: 6,
    title: "Order Status Update",
    message: "Order #151087 status updated to In Transit",
    timestamp: "3 days ago",
    read: true,
    type: "order",
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case "order":
      return "bg-blue-100 text-blue-700";
    case "dealer":
      return "bg-green-100 text-green-700";
    case "system":
      return "bg-purple-100 text-purple-700";
    case "alert":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(notificationsList);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    if (filter === "read") return notif.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleRead = (id: number) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: !notif.read } : notif,
      ),
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Notifications
          </h1>
          <p className="text-gray-500">
            You have {unreadCount} unread notification
            {unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            className="bg-[#F87B1B] text-white hover:bg-[#e06a0a]"
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="flex gap-3 mb-8">
        {["all", "unread", "read"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as "all" | "unread" | "read")}
            className={`px-6 py-2 rounded-lg font-semibold capitalize transition ${
              filter === f
                ? "bg-[#F87B1B] text-white"
                : "bg-orange-50 text-[#F87B1B] hover:bg-orange-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <Card key={notification.id} className="rounded-xl overflow-hidden">
              <CardContent
                className={`p-5 ${!notification.read ? "bg-orange-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${getTypeColor(notification.type)}`}
                      >
                        {notification.type.charAt(0).toUpperCase() +
                          notification.type.slice(1)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleRead(notification.id)}
                      className="p-2 rounded-lg hover:bg-gray-200 transition text-gray-500 hover:text-[#F87B1B]"
                      title={
                        notification.read ? "Mark as unread" : "Mark as read"
                      }
                    >
                      {notification.read ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 rounded-lg hover:bg-red-100 transition text-gray-500 hover:text-red-600"
                      title="Delete notification"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="rounded-xl">
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Notifications
              </h3>
              <p className="text-gray-500">
                {filter === "unread" &&
                  "You're all caught up! No unread notifications."}
                {filter === "read" && "No read notifications yet."}
                {filter === "all" && "You don't have any notifications yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
