"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Eye, MapPin, Plus, Search } from "lucide-react";
import { getTour, getSurvey } from "@/services/masterData";
import { getFirestoreDB } from "@/firebase";
import { collection, getDocs, query } from "firebase/firestore";

// 🔹 DATE FORMATTER
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

  // Surveys
  const [allSurveys, setAllSurveys] = useState<any[]>([]);

  // Expenses
  const [allExpenses, setAllExpenses] = useState<any[]>([]);

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

  // Fetch all surveys to compute stats
  useEffect(() => {
    const cached = localStorage.getItem("asm_all_surveys_cache");

    if (cached) {
      try {
        const data = JSON.parse(cached || "[]");
        setAllSurveys(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error parsing cached surveys:", err);
      }
    }

    const fetchAllSurveys = async () => {
      try {
        const res: any = await getSurvey();
        const data = res && res.data ? res.data : [];
        if (Array.isArray(data)) {
          setAllSurveys(data);
          localStorage.setItem("asm_all_surveys_cache", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error fetching all surveys:", error);
      }
    };

    fetchAllSurveys();
  }, []);

  // Fetch all expenses to compute stats
  useEffect(() => {
    const fetchAllExpenses = async () => {
      try {
        const db = getFirestoreDB();
        const expensesRef = collection(db, "expenses");
        const querySnapshot = await getDocs(expensesRef);

        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });

        if (Array.isArray(data)) {
          setAllExpenses(data);
        }
      } catch (error) {
        console.error("Error fetching all expenses from collection:", error);
      }
    };
    fetchAllExpenses();
  }, []);

  // ✅ PRE-FETCH OSRM ROUTING BACKGROUND TASK
  useEffect(() => {
    if (tours.length === 0 || allSurveys.length === 0) return;

    let isCancelled = false;
    const prefetchRoutes = async () => {
      // Prioritize active tours
      const activeTours = tours.filter((t: any) => t.status === true);
      for (const tour of activeTours) {
        if (isCancelled) break;
        const tourId = tour.id;
        if (!tourId) continue;

        // Skip if already perfectly cached
        if (localStorage.getItem(`osrm_${tourId}`)) continue;

        const surveyPoints = allSurveys.filter((s) => s.tourId === tourId);
        const mappedData = surveyPoints
          .map((s: any) => ({
            id: s.id,
            latitude: s.latLong?.latitude,
            longitude: s.latLong?.longitude,
          }))
          .filter((loc: any) => loc.latitude && loc.longitude);

        if (mappedData.length > 1) {
          const coords = mappedData
            .map((loc) => `${loc.longitude},${loc.latitude}`)
            .join(";");

          let fetchCoords = coords;
          if (mappedData.length > 90) {
            fetchCoords = mappedData
              .slice(0, 90)
              .map((loc) => `${loc.longitude},${loc.latitude}`)
              .join(";");
          }
          try {
            const res = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${fetchCoords}?overview=full&geometries=geojson`,
            );
            const data = await res.json();
            if (data.code === "Ok" && data.routes && data.routes.length > 0) {
              const route = data.routes[0];
              const pathInfo = route.geometry.coordinates.map((c: any) => [
                c[1],
                c[0],
              ]);
              const routeLegs = route.legs || [];
              localStorage.setItem(
                `osrm_${tourId}`,
                JSON.stringify({ pathInfo, routeLegs }),
              );
            }
            // Throttle to prevent overloading OSRM API (1 request per second max)
            await new Promise((r) => setTimeout(r, 600));
          } catch (err) {
            console.warn("Silent OSRM Prefetch Error", err);
          }
        }
      }
    };
    prefetchRoutes();

    return () => {
      isCancelled = true;
    };
  }, [tours, allSurveys]);

  const filteredTours = useMemo(() => {
    const baseTours =
      activeTab === "ACTIVE TOUR"
        ? tours.filter((t: any) => t.status === true)
        : [...tours];

    return baseTours.sort((a: any, b: any) => {
      const parseDate = (d: any) => {
        if (!d) return 0;
        if (d._seconds) return d._seconds * 1000;
        if (typeof d === "string" || typeof d === "number")
          return new Date(d).getTime();
        if (d.toDate) return d.toDate().getTime();
        return 0;
      };

      const timeA = parseDate(a.createdAt) || parseDate(a.startDate);
      const timeB = parseDate(b.createdAt) || parseDate(b.startDate);

      return timeB - timeA; // Descending: newest to oldest
    });
  }, [activeTab, tours]);

  const surveyStats = useMemo(() => {
    const todayStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const activeTourIds = new Set(filteredTours.map((t: any) => t.id));
    const relatedSurveys = allSurveys.filter((s) =>
      activeTourIds.has(s.tourId),
    );

    return {
      total: relatedSurveys.length,
      today: relatedSurveys.filter((s) => formatDate(s.createdAt) === todayStr)
        .length,
    };
  }, [allSurveys, filteredTours]);

  const expenseStats = useMemo(() => {
    const todayStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const stats = {
      total: allExpenses.reduce((sum, item) => {
        const amt = parseFloat(String(item?.amount || 0));
        return sum + (isNaN(amt) ? 0 : amt);
      }, 0),
      today: allExpenses
        .filter((e) => {
          const matched = formatDate(e.createdAt) === todayStr;
          return matched;
        })
        .reduce((sum, item) => {
          const amt = parseFloat(String(item?.amount || 0));
          return sum + (isNaN(amt) ? 0 : amt);
        }, 0),
    };

    console.log("Today Date String:", todayStr);
    console.log("Expense Stats Calculated:", stats);
    console.log("All Expenses Data:", allExpenses);

    return stats;
  }, [allExpenses]);

  const tabs = ["ACTIVE TOUR", "All TOUR"];

  // ✅ SEND TOUR ID
  const handleViewSurvey = (tourId: string) => {
    router.push(`/asm-survey/survey-details?tourId=${tourId}`);
  };

  const handleViewExpenses = (tourId: string) => {
    router.push(`/asm-survey/expenses?tourId=${tourId}&filter=1&number=2`);
  };

  const handleViewLocation = (tourId: string) => {
    router.push(`/asm-survey/location?tourId=${tourId}`);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const searchedTours = useMemo(() => {
    if (!searchTerm.trim()) return filteredTours;
    const term = searchTerm.toLowerCase();
    return filteredTours.filter(
      (t: any) =>
        (t.tourName || "").toLowerCase().includes(term) ||
        (t.staffId || "").toLowerCase().includes(term) ||
        (t.staffName || "").toLowerCase().includes(term) ||
        (t.staffPhone || "").toLowerCase().includes(term),
    );
  }, [filteredTours, searchTerm]);

  const totalPages = Math.ceil(searchedTours.length / itemsPerPage);
  const paginatedTours = searchedTours.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <DashboardLayout>
      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="rounded-xl">
          <CardContent className="flex justify-between items-center gap-3 p-3">
            <Image
              src="/survey.png"
              alt="Today Survey"
              width={60}
              height={60}
            />
            <div>
              <p className="text-sm text-gray-500 pb-2">Today Survey</p>
              <h3 className="text-2xl font-bold">{surveyStats.today}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="flex justify-between items-center gap-3 p-3">
            <Image
              src="/survey.png"
              alt="Total Survey"
              width={60}
              height={60}
            />
            <div>
              <p className="text-sm text-gray-500 pb-2">Total Survey</p>
              <h3 className="text-2xl font-bold">{surveyStats.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="flex justify-between items-center gap-3 p-3">
            <Image
              src="/wallet.png"
              alt="Today Expense"
              width={60}
              height={60}
            />
            <div>
              <p className="text-sm text-gray-500 pb-2">Today Expense</p>
              <h3 className="text-2xl font-bold">
                ₹{expenseStats.today.toLocaleString("en-IN")}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="flex justify-between items-center gap-3 p-3">
            <Image
              src="/wallet.png"
              alt="Total Expense"
              width={60}
              height={60}
            />
            <div>
              <p className="text-sm text-gray-500 pb-2">Total Expense</p>
              <h3 className="text-2xl font-bold">
                ₹{expenseStats.total.toLocaleString("en-IN")}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Survey</h2>

          <div className="relative w-full lg:w-[400px]">
            <input
              type="text"
              placeholder="Search by Title, ASM ID, Name or Mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87B1B] transition-all text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

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
              {paginatedTours.length > 0 &&
                paginatedTours.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 text-sm">
                    <TableCell>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>

                    <TableCell className="font-medium">
                      {item.tourName || "—"}
                    </TableCell>

                    <TableCell>
                      {item.staffId?.substring(0, 12) || "—"}
                    </TableCell>

                    {/* START DATE */}
                    <TableCell>{formatDate(item.startDate)}</TableCell>

                    {/* USER NAME */}
                    <TableCell>{item?.staffName || "name"}</TableCell>

                    <TableCell>{item.staffPhone || "number"}</TableCell>

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

              {!loading && paginatedTours.length === 0 && (
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

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 py-6 border-t mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="text-[#F87B1B] border-[#F87B1B] hover:bg-[#F87B1B1A]"
          >
            Previous
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={
                  currentPage === page
                    ? "bg-[#F87B1B] text-white hover:bg-[#e66a15]"
                    : "text-[#F87B1B] border-[#F87B1B] hover:bg-[#F87B1B1A]"
                }
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="text-[#F87B1B] border-[#F87B1B] hover:bg-[#F87B1B1A]"
          >
            Next
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
