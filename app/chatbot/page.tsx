"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Send, MessageCircle, Zap } from "lucide-react"

interface ChatMessage {
  id: number
  sender: "user" | "bot"
  message: string
  timestamp: string
}

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "bot",
    message: "Hello! 👋 I'm your AI Assistant. How can I help you today?",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    sender: "user",
    message: "What are the latest orders?",
    timestamp: "10:31 AM",
  },
  {
    id: 3,
    sender: "bot",
    message:
      "You have 12 new orders in the system. The top order is #151056 from Kabir Nag with 550t quantity. Would you like to see more details?",
    timestamp: "10:31 AM",
  },
  {
    id: 4,
    sender: "user",
    message: "Show me pending orders",
    timestamp: "10:32 AM",
  },
  {
    id: 5,
    sender: "bot",
    message:
      "There are currently 8 pending orders. The oldest pending order is from 5/12/2025 for Bharat Sahu with 550t. Would you like to take action on any of these orders?",
    timestamp: "10:32 AM",
  },
]

const quickPrompts = [
  "Show recent orders",
  "Dealer statistics",
  "Revenue report",
  "Order status",
]

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [inputMessage, setInputMessage] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: messages.length + 1,
      sender: "user",
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate bot response
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: messages.length + 2,
        sender: "bot",
        message: generateBotResponse(inputMessage),
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      setMessages((prev) => [...prev, botMessage])
    }, 800)

    setInputMessage("")
  }

  const generateBotResponse = (userInput: string): string => {
    const responses: { [key: string]: string } = {
      order: "I found 15 orders in the system. Would you like to filter by status or dealer?",
      dealer:
        "There are 502 active dealers. You can view detailed analytics in the Dealer section.",
      revenue:
        "Total revenue this month is $125,450 with a 12.5% increase compared to last month.",
      status:
        "Order status breakdown: 45% Completed, 30% In Progress, 25% Pending. Any specific order you need help with?",
      help: "I can help you with: orders, dealers, revenue, analytics, and more. What would you like to know?",
    }

    const lowerInput = userInput.toLowerCase()
    for (const [key, value] of Object.entries(responses)) {
      if (lowerInput.includes(key)) {
        return value
      }
    }

    return "I understand. Let me process that. Based on the system data, here's what I found: You have access to comprehensive analytics and management tools. Would you like more specific information about any metric?"
  }

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt)
  }

  return (
    <DashboardLayout>
      {/* ================= PAGE HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Chat Bot</h1>
        <p className="text-gray-500">Get instant help with your business queries</p>
      </div>

      {/* ================= MAIN CHAT CONTAINER ================= */}
      <Card className="rounded-xl h-[calc(100vh-300px)] flex flex-col">
        <CardContent className="flex flex-col h-full p-6">
          {/* ===== CHAT MESSAGES ===== */}
          <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-lg px-4 py-3 rounded-xl ${
                    msg.sender === "user"
                      ? "bg-[#F87B1B] text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm font-medium">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === "user" ? "text-orange-100" : "text-gray-500"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ===== QUICK PROMPTS ===== */}
          {messages.length === initialMessages.length && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3 font-medium">Quick Prompts:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="px-4 py-2 border border-[#F87B1B] text-[#F87B1B] rounded-lg text-sm font-medium hover:bg-orange-50 transition"
                  >
                    <Zap className="w-3 h-3 inline mr-1" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== INPUT FORM ===== */}
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F87B1B]"
            />
            <Button
              type="submit"
              className="bg-[#F87B1B] text-white hover:bg-[#e06a0a] px-6 py-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ================= FEATURES ================= */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Available Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Order Management",
              description: "Get insights about orders, status, and delivery",
            },
            {
              title: "Analytics",
              description: "Ask for revenue, sales, and performance metrics",
            },
            {
              title: "Dealer Info",
              description: "Information about dealers and sub-dealers",
            },
          ].map((feature) => (
            <Card key={feature.title} className="rounded-xl">
              <CardContent className="p-6">
                <MessageCircle className="w-8 h-8 text-[#F87B1B] mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
