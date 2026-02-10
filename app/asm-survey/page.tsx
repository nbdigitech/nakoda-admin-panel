"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddStaffModal from "@/components/staff/add-staff-modal";
import { Eye, MapPin, Plus } from "lucide-react";
import { getTour } from "@/services/masterData";

// 🔹 Firestore

/* ================= SURVEY STATS ================= */
const surveyStats = [
  { title: "Today Survey", value: "3", image: "/survey.png" },
  { title: "Total Survey", value: "520", image: "/survey.png" },
  { title: "Today Expense", value: "2500", image: "/wallet.png" },
  { title: "Total Expense", value: "1,24,564", image: "/wallet.png" },
];

/* ================= DATE FORMATTER ================= */
const formatDate = (timestamp: any) => {
  if (!timestamp) return "—";

  let date: Date;

  if (typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else if (timestamp.seconds !== undefined) {
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp._seconds !== undefined) {
    date = new Date(timestamp._seconds * 1000);
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AsmSurveyPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("ACTIVE TOUR");

  // 🔹 Tours
  const [tours, setTours] = useState<any[]>([]);

  // 🔹 Users cache (FULL USER DATA)
  const [userMap, setUserMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // ✅ LOAD PREVIOUS DATA + BACKGROUND FETCH
  useEffect(() => {
    const cachedTours = localStorage.getItem("asm_tours_cache");
    if (cachedTours) {
      setTours(JSON.parse(cachedTours));
      setLoading(false); // Show previous data immediately
    }

    const fetchTours = async () => {
      try {
        const res: any = await getTour();
        if (res && res.data) {
          setTours(res.data);
          localStorage.setItem("asm_tours_cache", JSON.stringify(res.data));
        }
      } catch (error) {
        console.error("Error fetching tours:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  const tabs = ["ACTIVE TOUR", "All Tour"];

  const filteredTours =
    activeTab === "ACTIVE TOUR"
      ? tours.filter((t) => t.status === true)
      : tours.filter((t) => t.status === false);

  // ✅ SEND TOUR ID
  const handleViewSurvey = (tourId: string) => {
    router.push(`/asm-survey/survey-details?tourId=${tourId}`);
  };

  const handleViewExpenses = (tourId: string) => {
    router.push(`/asm-survey/expenses?tourId=${tourId}`);
  };

  const handleViewLocation = (tourId: string) => {
    router.push(`/asm-survey/location?tourId=${tourId}`);
  };

  return (
    <DashboardLayout>
      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {surveyStats.map((stat) => (
          <Card key={stat.title} className="rounded-xl">
            <CardContent className="flex justify-between items-center gap-3 p-3">
              <Image src={stat.image} alt={stat.title} width={60} height={60} />
              <div>
                <p className="text-sm text-gray-500 pb-2">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Survey</h2>

        {/* Tabs + Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-6 py-2 rounded-lg font-semibold text-sm transition"
                style={
                  activeTab === tab
                    ? { backgroundColor: "#F87B1B1A", color: "#F87B1B" }
                    : { backgroundColor: "transparent", color: "#F87B1B" }
                }
              >
                {tab}
              </button>
            ))}
          </div>

          <AddStaffModal
            trigger={
              <button className="bg-[#7FFF7C5C] text-sm text-[#009846] font-bold py-3 px-12 rounded-lg flex items-center">
                <Plus className="w-5 h-5 mr-1" />
                Add ASM
              </button>
            }
          />
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S No.</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>ASM ID</TableHead>
                <TableHead>Survey Date</TableHead>
                <TableHead>ASM Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Expenses</TableHead>
                <TableHead>Survey</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && tours.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-6 text-gray-500"
                  >
                    Loading tours...
                  </TableCell>
                </TableRow>
              )}

              {/* Show previous data or new data */}
              {tours.length > 0 &&
                filteredTours.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 text-sm">
                    <TableCell>{index + 1}</TableCell>

                    <TableCell className="font-medium">
                      {item.tourName || "—"}
                    </TableCell>

                    <TableCell>
                      {item.staffId?.substring(0, 12) || "—"}
                    </TableCell>

                    {/* START DATE */}
                    <TableCell>{formatDate(item.startDate)}</TableCell>

                    {/* USER NAME */}
                    <TableCell>{userMap[item.staffId]?.name || "—"}</TableCell>

                    <TableCell>
                      {userMap[item.staffId]?.phone ||
                        userMap[item.staffId]?.phoneNumber ||
                        "—"}
                    </TableCell>

                    <TableCell>
                      <Button
                        onClick={() => handleViewExpenses(item.id)}
                        variant="ghost"
                        className="text-[#F87B1B]"
                        style={{ backgroundColor: "#F87B1B1A" }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </TableCell>

                    <TableCell>
                      <Button
                        onClick={() => handleViewSurvey(item.id)}
                        variant="ghost"
                        className="text-[#F87B1B]"
                        style={{ backgroundColor: "#F87B1B1A" }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </TableCell>

                    <TableCell>
                      <Button
                        onClick={() => handleViewLocation(item.id)}
                        variant="ghost"
                        className="text-[#009846]"
                        style={{ backgroundColor: "#c8efd9" }}
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        Location
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && filteredTours.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-6 text-gray-500"
                  >
                    No surveys found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
