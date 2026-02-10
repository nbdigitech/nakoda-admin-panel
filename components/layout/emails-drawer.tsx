"use client"

import { useState } from "react"
import Link from "next/link"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Trash2, Star } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Email {
  id: number
  from: string
  subject: string
  preview: string
  timestamp: string
  read: boolean
  starred: boolean
}

interface EmailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const emailsList: Email[] = [
  {
    id: 1,
    from: "support@nakodatmt.com",
    subject: "Order Confirmation - #151089",
    preview: "Your order has been confirmed and is being processed...",
    timestamp: "Today, 9:30 AM",
    read: false,
    starred: true,
  },
  {
    id: 2,
    from: "accounts@nakodatmt.com",
    subject: "Payment Invoice #INV-2025-001",
    preview: "Invoice for your recent order is attached...",
    timestamp: "Yesterday, 2:15 PM",
    read: true,
    starred: false,
  },
  {
    id: 3,
    from: "shipping@nakodatmt.com",
    subject: "Shipment Update - Order #151087",
    preview: "Your order has been shipped...",
    timestamp: "2 days ago",
    read: true,
    starred: false,
  },
  {
    id: 4,
    from: "dealer@example.com",
    subject: "Query about bulk order",
    preview: "Is it possible to get a special discount for...",
    timestamp: "4 days ago",
    read: true,
    starred: false,
  },
  {
    id: 5,
    from: "you@example.com",
    subject: "Re: Weekly Sales Report",
    preview: "Attached is the weekly sales report...",
    timestamp: "3 days ago",
    read: true,
    starred: false,
  },
]

export default function EmailsDrawer({ open, onOpenChange }: EmailsDrawerProps) {
  const [emails, setEmails] = useState(emailsList)

  const unreadCount = emails.filter((e) => !e.read).length

  const toggleStar = (id: number) => {
    setEmails(
      emails.map((email) =>
        email.id === id ? { ...email, starred: !email.starred } : email
      )
    )
  }

  const deleteEmail = (id: number) => {
    setEmails(emails.filter((email) => email.id !== id))
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="flex justify-between items-center border-b px-6 py-4">
          <div>
            <DrawerTitle className="text-2xl font-bold">Emails</DrawerTitle>
            <p className="text-sm text-gray-500 mt-1">
              You have {unreadCount} unread email{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/emails">
            <Button className="bg-[#F87B1B] text-white hover:bg-[#e06a0a]">
              View All
            </Button>
          </Link>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-2 py-4">
            {emails.slice(0, 5).map((email) => (
              <Card
                key={email.id}
                className={`rounded-lg cursor-pointer transition hover:border-[#F87B1B] ${
                  !email.read ? "bg-orange-50" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`text-sm truncate ${
                            email.read ? "text-gray-600" : "text-gray-900 font-bold"
                          }`}
                        >
                          {email.from}
                        </h4>
                      </div>
                      <p
                        className={`text-xs truncate mb-1 ${
                          email.read ? "text-gray-500" : "text-gray-700 font-medium"
                        }`}
                      >
                        {email.subject}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{email.preview}</p>
                      <p className="text-xs text-gray-400 mt-1">{email.timestamp}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleStar(email.id)}
                        className="p-1.5 rounded hover:bg-gray-200 text-gray-400"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            email.starred ? "fill-[#F87B1B] text-[#F87B1B]" : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => deleteEmail(email.id)}
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
