"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Trash2, Eye, EyeOff } from "lucide-react";
import { getFirestoreDB } from "@/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  createdAt: any;
  read: boolean;
  type: string;
}

const getTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "order":
      return "bg-blue-100 text-blue-700";
    case "dealer":
    case "sub-dealer":
    case "staff":
      return "bg-green-100 text-green-700";
    case "rate":
      return "bg-yellow-100 text-yellow-700";
    case "system":
      return "bg-purple-100 text-purple-700";
    case "alert":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const db = getFirestoreDB();

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        let jsDate = new Date();
        if (data.createdAt?.toDate) {
          jsDate = data.createdAt.toDate();
        } else if (data.createdAt) {
          jsDate = new Date(data.createdAt);
        }
        notifs.push({
          id: doc.id,
          ...data,
          timestamp: formatTimeAgo(jsDate),
        } as Notification);
      });
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, [db]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleRead = async (id: string, currentRead: boolean) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: !currentRead });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        if (!n.read) {
          batch.update(doc(db, "notifications", n.id), { read: true });
        }
      });
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
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

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
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
                      onClick={() =>
                        toggleRead(notification.id, notification.read)
                      }
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
                You don't have any notifications yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
