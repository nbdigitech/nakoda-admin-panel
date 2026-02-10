"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit2, Trash2, Plus } from "lucide-react"

interface Permission {
  id: number
  name: string
  description: string
  users: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

const permissions: Permission[] = [
  {
    id: 1,
    name: "Dashboard Access",
    description: "View dashboard and analytics",
    users: "245 users",
    canView: true,
    canCreate: false,
    canEdit: true,
    canDelete: false,
  },
  {
    id: 2,
    name: "Dealer Management",
    description: "Create and manage dealers",
    users: "89 users",
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
  },
  {
    id: 3,
    name: "Order Management",
    description: "Manage all orders",
    users: "156 users",
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false,
  },
  {
    id: 4,
    name: "Staff Management",
    description: "Create and manage staff",
    users: "45 users",
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
  },
  {
    id: 5,
    name: "Analytics View",
    description: "View analytics and reports",
    users: "123 users",
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  },
]

export default function PermissionPage() {
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

  const togglePermission = (id: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  return (
    <DashboardLayout>
      {/* ================= PAGE HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Permissions</h1>
        <p className="text-gray-500">Manage user permissions and access control</p>
      </div>

      {/* ================= HEADER WITH ACTION ================= */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search permissions..."
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
          />
        </div>
        <Button className="bg-[#F87B1B] text-white hover:bg-[#e06a0a]">
          <Plus className="w-4 h-4 mr-2" />
          Add Permission
        </Button>
      </div>

      {/* ================= PERMISSIONS TABLE ================= */}
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 hover:bg-transparent">
                  <TableHead className="w-10">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm">
                    Permission Name
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm">
                    Description
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-center">
                    Users
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-center">
                    View
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-center">
                    Create
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-center">
                    Edit
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-center">
                    Delete
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-sm text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow
                    key={permission.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-gray-900 text-sm">
                        {permission.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-gray-500 text-sm">{permission.description}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <p className="text-sm font-semibold text-gray-900">
                        {permission.users}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox checked={permission.canView} disabled />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox checked={permission.canCreate} disabled />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox checked={permission.canEdit} disabled />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox checked={permission.canDelete} disabled />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <Edit2 className="w-4 h-4 text-[#F87B1B]" />
                        </button>
                        <button className="p-2 hover:bg-red-100 rounded-lg transition">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ================= PERMISSION GROUPS ================= */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Permission Groups</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Admin", "Manager", "User"].map((group) => (
            <Card key={group} className="rounded-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{group}</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox defaultChecked />
                    <span className="text-sm text-gray-600">View Content</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox defaultChecked={group !== "User"} disabled={group === "User"} />
                    <span className="text-sm text-gray-600">Create Content</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox defaultChecked={group !== "User"} />
                    <span className="text-sm text-gray-600">Edit Content</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox defaultChecked={group === "Admin"} />
                    <span className="text-sm text-gray-600">Delete Content</span>
                  </label>
                </div>
                <Button className="w-full mt-6 bg-[#F87B1B] text-white hover:bg-[#e06a0a]">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
