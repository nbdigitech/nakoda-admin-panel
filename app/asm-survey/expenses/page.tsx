"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Loader2, Edit } from "lucide-react";
import { getExpenses } from "@/services/masterData";
import { RemarksDrawer } from "@/components/expenses/remarks-drawer";
import { getFirestoreDB } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface Expense {
  id: string;
  category: string;
  amount: number;
  image?: string;
  status?: string;
  remarks?: string;
  tourId?: string;
}

interface SurveyRoute {
  id: string | number;
  title: string;
  date: string;
  expenses: Expense[];
  totalExpense: number;
  remarks?: string;
  status?: string;
}

function ExpensesContent() {
  const searchParams = useSearchParams();
  const tourId = searchParams.get("tourId");

  const [surveyRoutes, setSurveyRoutes] = useState<SurveyRoute[]>([]);
  const [expandedRoutes, setExpandedRoutes] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValue, setFilterValue] = useState("0"); // 0: today, 1: 1 month, 2: 3 months
  const [remarkDrawerOpen, setRemarkDrawerOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const fetchExpenses = async () => {
    if (!tourId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const db = getFirestoreDB();
      const expensesRef = collection(db, "expenses");
      const q = query(expensesRef, where("tourId", "==", tourId));
      const querySnapshot = await getDocs(q);

      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });

      if (Array.isArray(data)) {
        const mappedExpenses: Expense[] = data.map((item: any) => ({
          id: item.id,
          category: item.category || item.description || "General",
          amount: Number(item.amount) || 0,
          image: item.image,
          status: item.status || "pending",
          remarks: item.remarks || "",
          tourId: item.tourId,
        }));

        const total = mappedExpenses.reduce(
          (sum: number, item: any) => sum + item.amount,
          0,
        );

        const getDateString = (item: any): string => {
          const dateField = item?.createdAt;
          if (!dateField) return "Recent";

          try {
            let date: Date;
            if (dateField.seconds !== undefined) {
              date = new Date(dateField.seconds * 1000);
            } else if (dateField._seconds !== undefined) {
              date = new Date(dateField._seconds * 1000);
            } else if (typeof dateField === "number") {
              date = new Date(dateField);
            } else if (typeof dateField === "string") {
              date = new Date(dateField);
            } else if (dateField instanceof Date) {
              date = dateField;
            } else if (typeof dateField.toDate === "function") {
              date = dateField.toDate();
            } else {
              return "Recent";
            }

            return date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          } catch (error) {
            return "Recent";
          }
        };

        const route: SurveyRoute = {
          id: tourId,
          title: "Tour Expenses",
          date: data[0] ? getDateString(data[0]) : "Recent",
          expenses: mappedExpenses,
          totalExpense: total,
        };

        setSurveyRoutes([route]);
        setExpandedRoutes([tourId]);
      } else {
        setSurveyRoutes([]);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [tourId, filterValue]);

  const toggleRoute = (id: string | number) => {
    setExpandedRoutes((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const openRemarkDrawer = (expense: Expense) => {
    setSelectedExpense(expense);
    setRemarkDrawerOpen(true);
  };

  const closeRemarkDrawer = () => {
    setRemarkDrawerOpen(false);
    setSelectedExpense(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#F87B1B]" />
        <p className="text-gray-500">Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className=" min-h-screen space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[20px] font-bold ">ASM Survey Expenses</h2>
        <div className="flex gap-3">
          <select className="px-4 py-2 border rounded-lg text-sm bg-[#F87B1B1A] text-[#F87B1B] font-semibold">
            <option>District</option>
          </select>
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className=" bg-[#F87B1B1A] text-[#F87B1B] px-4 py-2 border rounded-lg text-sm"
          >
            <option value="0">Today</option>
            <option value="1">1 Month</option>
            <option value="2">3 Months</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {surveyRoutes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-gray-500">No expenses found for this tour.</p>
          </div>
        ) : (
          surveyRoutes.map((route) => (
            <div key={route.id} className="space-y-2">
              <div className="flex justify-between items-center gap-4">
                <div className="w-full bg-[#F87B1B1A] rounded-lg px-6 py-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-semibold text-[#F87B1B]">
                      {route.title}
                    </h3>
                    <p className="text-sm py-1 ">{route.date}</p>
                  </div>
                  <button
                    onClick={() => toggleRoute(route.id)}
                    className="text-[#F87B1B] hover:opacity-80"
                  >
                    {expandedRoutes.includes(route.id) ? (
                      <Minus className="w-6 h-6" />
                    ) : (
                      <Plus className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
              {expandedRoutes.includes(route.id) && (
                <div className="bg-white rounded-lg border p-5 w-full lg:w-[87%]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>S No.</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {route.expenses.map((exp, index) => (
                        <TableRow key={exp.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{exp.category}</TableCell>
                          <TableCell className="font-semibold text-orange-600">
                            ₹ {exp.amount}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                exp.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : exp.status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {exp.status || "pending"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {exp.image ? (
                              <img
                                src={
                                  exp.image.startsWith("data:") ||
                                  exp.image.startsWith("http")
                                    ? exp.image
                                    : `data:image/jpeg;base64,${exp.image}`
                                }
                                alt="Receipt"
                                className="w-12 h-12 object-cover rounded-md border"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-md border">
                                <span className="text-[10px] text-gray-400">
                                  No Image
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => openRemarkDrawer(exp)}
                              disabled={exp.status === "approved"}
                              variant="ghost"
                              size="sm"
                              className={`text-[#F87B1B] hover:text-[#E86A0A] hover:bg-[#F87B1B1A] ${exp.status === "approved" ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="text-sm text-gray-500 pt-4">
                    Total Expense :{" "}
                    <span className="font-semibold">
                      ₹ {route.totalExpense}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <RemarksDrawer
        isOpen={remarkDrawerOpen}
        onClose={closeRemarkDrawer}
        expense={selectedExpense}
        onRefresh={fetchExpenses}
      />
    </div>
  );
}

export default function SurveyExpensesPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#F87B1B]" />
          </div>
        }
      >
        <ExpensesContent />
      </Suspense>
    </DashboardLayout>
  );
}
