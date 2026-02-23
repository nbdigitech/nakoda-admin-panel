"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSurvey, getDistrict } from "@/services/masterData";
import { useMemo } from "react";

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

function SurveyDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tourId = searchParams.get("tourId");

  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtMap, setDistrictMap] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const cachedDistricts = localStorage.getItem("master_districts_cache");
    if (cachedDistricts) {
      setDistrictMap(JSON.parse(cachedDistricts));
    }

    const fetchDistricts = async () => {
      try {
        const districtRes: any = await getDistrict();
        const districtData = districtRes?.data || districtRes;

        if (Array.isArray(districtData)) {
          const map: Record<string, string> = {};
          districtData.forEach((d: any) => {
            const id = d.id || d.uid || d._id || d.districtId;
            if (id) {
              map[String(id)] = d.name || d.districtName;
            }
          });
          setDistrictMap(map);
          localStorage.setItem("master_districts_cache", JSON.stringify(map));
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };

    fetchDistricts();
  }, []);

  useEffect(() => {
    const cachedSurveys = localStorage.getItem(`surveys_${tourId}`);
    if (cachedSurveys) {
      setSurveys(JSON.parse(cachedSurveys));
      setLoading(false);
    }

    const fetchData = async () => {
      if (!tourId) return;

      try {
        const surveyRes: any = await getSurvey({ tourId });

        if (surveyRes && surveyRes.data) {
          setSurveys(surveyRes.data);
          localStorage.setItem(
            `surveys_${tourId}`,
            JSON.stringify(surveyRes.data),
          );
        }
      } catch (error) {
        console.error("Error fetching survey details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tourId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const searchedSurveys = useMemo(() => {
    if (!searchTerm.trim()) return surveys;
    const term = searchTerm.toLowerCase();
    return surveys.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(term) ||
        (s.shopName || "").toLowerCase().includes(term) ||
        (s.designation || "").toLowerCase().includes(term) ||
        (s.mobile || "").toLowerCase().includes(term) ||
        (s.location || "").toLowerCase().includes(term),
    );
  }, [surveys, searchTerm]);

  const totalPages = Math.ceil(searchedSurveys.length / itemsPerPage);
  const paginatedSurveys = searchedSurveys.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

  const handleNextImage = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => (prev! + 1) % surveys.length);
  };

  const handlePrevImage = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex(
      (prev) => (prev! - 1 + surveys.length) % surveys.length,
    );
  };

  const handleLocationClick = (lat?: number, lng?: number, name?: string) => {
    let url = `/asm-survey/location?tourId=${tourId}`;
    if (lat && lng) url += `&lat=${lat}&lng=${lng}`;
    if (name) url += `&location=${encodeURIComponent(name)}`;
    router.push(url);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 gap-4">
        <h2 className="text-[20px] font-bold">
          Survey Details
          <span className="text-sm text-gray-500 pl-2">
            (Tour ID: {tourId})
          </span>
        </h2>

        <div className="relative w-full sm:w-[350px]">
          <input
            type="text"
            placeholder="Search by Name, Org, Designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87B1B] transition-all text-sm"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">S No.</TableHead>
                <TableHead className="text-xs">Org Name</TableHead>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Designation</TableHead>
                <TableHead className="text-xs">Mobile</TableHead>
                <TableHead className="text-xs">District</TableHead>
                <TableHead className="text-xs">Location</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Image</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && surveys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    Loading surveys...
                  </TableCell>
                </TableRow>
              )}

              {paginatedSurveys.length > 0 &&
                paginatedSurveys.map((detail, index) => (
                  <TableRow key={detail.id} className="hover:bg-gray-50">
                    <TableCell>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell>{detail.shopName || "—"}</TableCell>
                    <TableCell>{detail.name || "—"}</TableCell>
                    <TableCell>{detail.designation || "—"}</TableCell>
                    <TableCell>{detail.mobile || "—"}</TableCell>

                    <TableCell>
                      {districtMap[String(detail.districtId)] ||
                        districtMap[String(detail.districtuid)] ||
                        districtMap[String(detail.district_id)] ||
                        "—"}
                    </TableCell>

                    <TableCell>
                      <button
                        onClick={() =>
                          handleLocationClick(
                            detail.latLong?.latitude,
                            detail.latLong?.longitude,
                            detail.location,
                          )
                        }
                        className="px-2 py-1 rounded-lg text-xs bg-green-100 text-green-700 whitespace-nowrap"
                      >
                        📍 {detail.location || "View"}
                      </button>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {formatDate(detail.createdAt)}
                    </TableCell>

                    <TableCell>
                      {detail.image ? (
                        <div
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img
                            src={detail.image}
                            alt="survey"
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-lg" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && paginatedSurveys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    No surveys found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination & Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t gap-4">
          <div className="text-sm text-gray-600 font-medium">
            Total Surveys found:{" "}
            <span className="font-bold text-gray-900">
              {searchedSurveys.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
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
                ),
              )}
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
      </div>

      <Dialog
        open={selectedImageIndex !== null}
        onOpenChange={(open) => !open && setSelectedImageIndex(null)}
      >
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black/95 border-none">
          <DialogTitle className="sr-only">Survey Image View</DialogTitle>
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {selectedImageIndex !== null && surveys[selectedImageIndex] && (
              <>
                {surveys[selectedImageIndex].image ? (
                  <img
                    src={surveys[selectedImageIndex].image}
                    alt="Survey Fullview"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400">No Image Available</div>
                )}

                <div className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                  {surveys[selectedImageIndex].name} -{" "}
                  {formatDate(surveys[selectedImageIndex].createdAt)}
                </div>
              </>
            )}

            <button
              onClick={handlePrevImage}
              className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
            >
              <ChevronLeft size={32} />
            </button>

            <button
              onClick={handleNextImage}
              className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
            >
              <ChevronRight size={32} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-sm text-white">
              {(selectedImageIndex !== null ? selectedImageIndex : 0) + 1} /{" "}
              {surveys.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default function SurveyDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SurveyDetailsContent />
    </Suspense>
  );
}
