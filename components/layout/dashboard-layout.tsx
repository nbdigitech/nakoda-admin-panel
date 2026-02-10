"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "react-toastify"
import Sidebar from "./sidebar"
import Header from "./header"
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, authReady } = useFirebaseAuth()
  const router = useRouter()

  useEffect(() => {
    if (authReady && !user) {
      toast.error("Please login to access this page")
      router.push("/login")
    }
  }, [authReady, user, router])

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Sidebar (fixed) */}
      <Sidebar />

      {/* Content */}
      <div className="flex flex-col min-h-screen md:ml-56">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
