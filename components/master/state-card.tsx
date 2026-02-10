"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, Edit2 } from "lucide-react"
import AddStateModal from "./add-state-modal"

interface StateData {
  sNo: number
  stateId: string
  stateName: string
  status?: string
}

const stateData: StateData[] = [
  { sNo: 1, stateId: "#IJ3107", stateName: "Chhattisgarh", status: "active" },
  { sNo: 2, stateId: "#IJ3108", stateName: "Madhya Pradesh", status: "active" },
]

export default function StateCard() {
  const [states, setStates] = useState<StateData[]>(stateData)
  const [editingState, setEditingState] = useState<StateData | null>(null)

  const handleEditState = (state: StateData) => {
    setEditingState(state)
  }

  const handleSaveState = (updatedState: StateData) => {
    setStates(states.map(state => state.sNo === updatedState.sNo ? updatedState : state))
    setEditingState(null)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between ">
        <CardTitle className="text-lg font-semibold">State</CardTitle>
        <AddStateModal trigger={
          <Button className="bg-green-100 text-green-700 hover:bg-green-200 h-8 text-xs">
            + Add State
          </Button>
        } />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                <TableHead className="w-12 font-semibold text-gray-700">S No.</TableHead>
                <TableHead className="font-semibold text-gray-700">State Id</TableHead>
                <TableHead className="font-semibold text-gray-700">State Name</TableHead>
                <TableHead className="w-12 font-semibold text-gray-700"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {states.map((state) => (
                <TableRow key={state.sNo} className="border-b hover:bg-gray-50">
                  <TableCell className="text-gray-700">{state.sNo}</TableCell>
                  <TableCell className="text-gray-700">{state.stateId}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      {state.stateName}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <AddStateModal
                      initialData={editingState?.sNo === state.sNo ? editingState : state}
                      onSave={handleSaveState}
                      trigger={
                        <button 
                          onClick={() => handleEditState(state)}
                          className="text-orange-500 hover:text-orange-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
