"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Trash2, Archive, Reply, Forward, Star } from "lucide-react"

interface Email {
  id: number
  from: string
  subject: string
  preview: string
  body: string
  timestamp: string
  read: boolean
  starred: boolean
  type: "inbox" | "sent" | "draft"
}

const emailsList: Email[] = [
  {
    id: 1,
    from: "support@nakodatmt.com",
    subject: "Order Confirmation - #151089",
    preview: "Your order has been confirmed and is being processed...",
    body: "Thank you for placing order #151089. Your order for 550t has been confirmed and is being processed. You will receive a shipment notification shortly. Tracking details will be available within 24 hours.",
    timestamp: "Today, 9:30 AM",
    read: false,
    starred: true,
    type: "inbox",
  },
  {
    id: 2,
    from: "accounts@nakodatmt.com",
    subject: "Payment Invoice #INV-2025-001",
    preview: "Invoice for your recent order is attached...",
    body: "Please find attached the invoice for your recent order. Amount Due: $12,500. Payment is due within 30 days. Thank you for your business.",
    timestamp: "Yesterday, 2:15 PM",
    read: true,
    starred: false,
    type: "inbox",
  },
  {
    id: 3,
    from: "shipping@nakodatmt.com",
    subject: "Shipment Update - Order #151087",
    preview: "Your order has been shipped...",
    body: "Good news! Your order #151087 has been shipped. Tracking number: TRK-2025-54321. Your package is on its way and will arrive within 3-5 business days.",
    timestamp: "2 days ago",
    read: true,
    starred: false,
    type: "inbox",
  },
  {
    id: 4,
    from: "you@example.com",
    subject: "Re: Weekly Sales Report",
    preview: "Attached is the weekly sales report...",
    body: "Hi Team, Please find the weekly sales report for the period Jan 1-7, 2025. Total sales: $45,678. Please review and let me know if you need any clarifications.",
    timestamp: "3 days ago",
    read: true,
    starred: false,
    type: "sent",
  },
  {
    id: 5,
    from: "dealer@example.com",
    subject: "Query about bulk order",
    preview: "Is it possible to get a special discount for...",
    body: "Hi, We are interested in placing a bulk order of 2000t. Is it possible to get a special discount for such a large quantity? Please let me know the pricing details.",
    timestamp: "4 days ago",
    read: true,
    starred: false,
    type: "inbox",
  },
  {
    id: 6,
    from: "draft",
    subject: "Draft: Response to dealer inquiry",
    preview: "Thank you for your inquiry...",
    body: "Thank you for your inquiry. We offer competitive pricing for bulk orders. Let me prepare a detailed quote for you.",
    timestamp: "4 days ago",
    read: true,
    starred: false,
    type: "draft",
  },
]

export default function EmailPage() {
  const [emails, setEmails] = useState(emailsList)
  const [currentTab, setCurrentTab] = useState<"inbox" | "sent" | "draft">("inbox")
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)

  const filteredEmails = emails.filter((email) => email.type === currentTab)
  const unreadCount = emails.filter((e) => !e.read && e.type === "inbox").length

  const toggleStar = (id: number) => {
    setEmails(
      emails.map((email) =>
        email.id === id ? { ...email, starred: !email.starred } : email
      )
    )
  }

  const toggleRead = (id: number) => {
    setEmails(
      emails.map((email) =>
        email.id === id ? { ...email, read: !email.read } : email
      )
    )
  }

  const deleteEmail = (id: number) => {
    setEmails(emails.filter((email) => email.id !== id))
    setSelectedEmail(null)
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Emails</h1>
          <p className="text-gray-500">
            You have {unreadCount} unread email{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button className="bg-[#F87B1B] text-white hover:bg-[#e06a0a]">
          + Compose Email
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 border-b">
        {["inbox", "sent", "draft"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setCurrentTab(tab as "inbox" | "sent" | "draft")
              setSelectedEmail(null)
            }}
            className={`px-6 py-3 font-semibold capitalize transition border-b-2 ${
              currentTab === tab
                ? "border-[#F87B1B] text-[#F87B1B]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
            {tab === "inbox" && unreadCount > 0 && (
              <span className="ml-2 bg-[#F87B1B] text-white rounded-full px-2 py-0.5 text-xs">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {filteredEmails.length > 0 ? (
            filteredEmails.map((email) => (
              <Card
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`rounded-lg cursor-pointer transition ${
                  selectedEmail?.id === email.id
                    ? "border-[#F87B1B] bg-orange-50"
                    : !email.read && email.type === "inbox"
                    ? "bg-orange-50"
                    : ""
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                      className={`text-sm font-semibold truncate flex-1 ${
                        email.read ? "text-gray-700" : "text-gray-900 font-bold"
                      }`}
                    >
                      {email.from}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleStar(email.id)
                      }}
                      className="text-gray-400 hover:text-[#F87B1B]"
                    >
                      <Star
                        className={`w-4 h-4 ${email.starred ? "fill-[#F87B1B]" : ""}`}
                      />
                    </button>
                  </div>
                  <p
                    className={`text-xs truncate mb-1 ${
                      email.read ? "text-gray-500" : "text-gray-700 font-medium"
                    }`}
                  >
                    {email.subject}
                  </p>
                  <p className="text-xs text-gray-400">{email.timestamp}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="rounded-lg">
              <CardContent className="p-6 text-center">
                <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No emails</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Email Detail */}
        <div className="lg:col-span-2">
          {selectedEmail ? (
            <Card className="rounded-lg">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 pb-6 border-b">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedEmail.subject}
                    </h2>
                    <p className="text-gray-600 mb-1">From: {selectedEmail.from}</p>
                    <p className="text-sm text-gray-500">{selectedEmail.timestamp}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleStar(selectedEmail.id)}
                      className="p-2 rounded-lg hover:bg-gray-200 text-gray-500"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          selectedEmail.starred ? "fill-[#F87B1B] text-[#F87B1B]" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => deleteEmail(selectedEmail.id)}
                      className="p-2 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="mb-8">
                  <p className="text-gray-700 leading-relaxed">{selectedEmail.body}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button className="flex items-center gap-2 bg-[#F87B1B] text-white hover:bg-[#e06a0a]">
                    <Reply className="w-4 h-4" />
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-gray-300"
                  >
                    <Forward className="w-4 h-4" />
                    Forward
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-lg">
              <CardContent className="p-12 text-center">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No Email Selected
                </h3>
                <p className="text-gray-500">
                  Select an email from the list to view its contents
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
