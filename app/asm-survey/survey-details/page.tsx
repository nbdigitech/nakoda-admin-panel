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
import { Edit } from "lucide-react";
import UpdateRemarkDrawer from "@/components/asm/update-remark";
import { getSurvey, getDistrict } from "@/services/masterData";

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

  // ✅ READ tourId FROM URL
  const tourId = searchParams.get("tourId");

  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ DISTRICT ID → NAME MAP
  const [districtMap, setDistrictMap] = useState<Record<string, string>>({});

  /* ================= FETCH DISTRICTS (MASTER DATA) ================= */
  useEffect(() => {
    const cachedDistricts = localStorage.getItem("master_districts_cache");
    if (cachedDistricts) {
      setDistrictMap(JSON.parse(cachedDistricts));
    }

    const fetchDistricts = async () => {
      try {
        const districtRes: any = await getDistrict();
        console.log("Districts Raw Response:", districtRes);

        const districtData = districtRes?.data || districtRes;

        if (Array.isArray(districtData)) {
          const map: Record<string, string> = {};
          districtData.forEach((d: any) => {
            const id = d.id || d.uid || d._id || d.districtId;
            if (id) {
              map[String(id)] = d.name || d.districtName;
            }
          });
          console.log("Generated District Map:", map);
          setDistrictMap(map);
          localStorage.setItem("master_districts_cache", JSON.stringify(map));
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };

    fetchDistricts();
  }, []);

  /* ================= FETCH SURVEYS BY tour ID ================= */
  useEffect(() => {
    const cachedSurveys = localStorage.getItem(`surveys_${tourId}`);
    if (cachedSurveys) {
      setSurveys(JSON.parse(cachedSurveys));
      setLoading(false);
    }

    const fetchData = async () => {
      if (!tourId) return;

      try {
        // Fetch Surveys
        const surveyRes: any = await getSurvey({ tourId });
        console.log("Surveys for Tour:", tourId, surveyRes);

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

  /* ================= HANDLERS ================= */
  const handleLocationClick = (lat?: number, lng?: number, name?: string) => {
    let url = `/asm-survey/location?tourId=${tourId}`;
    if (lat && lng) url += `&lat=${lat}&lng=${lng}`;
    if (name) url += `&location=${encodeURIComponent(name)}`;
    router.push(url);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between pb-8">
        <h2 className="text-[20px] font-bold">
          Survey Details
          <span className="text-sm text-gray-500 pl-2">
            (Tour ID: {tourId})
          </span>
        </h2>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-xl shadow p-6 space-y-6">
        <div className="w-full overflow-x-hidden">
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
                <TableHead className="text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && surveys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6">
                    Loading surveys...
                  </TableCell>
                </TableRow>
              )}

              {/* Show cached or new surveys */}
              {surveys.length > 0 &&
                surveys.map((detail, index) => (
                  <TableRow key={detail.id} className="hover:bg-gray-50">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{detail.shopName || "—"}</TableCell>
                    <TableCell>{detail.name || "—"}</TableCell>
                    <TableCell>{detail.designation || "—"}</TableCell>
                    <TableCell>{detail.mobile || "—"}</TableCell>

                    {/* ✅ DISTRICT NAME RESOLVED HERE */}
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
                        className="px-2 py-1 rounded-lg text-xs bg-green-100 text-green-700"
                      >
                        📍 {detail.location || "View"}
                      </button>
                    </TableCell>

                    <TableCell>{formatDate(detail.createdAt)}</TableCell>

                    <TableCell>
                      {detail.image ? (
                        <img
                          src={detail.image}
                          alt="survey"
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-lg" />
                      )}
                    </TableCell>

                    <TableCell>
                      <UpdateRemarkDrawer
                        surveyId={detail.id}
                        trigger={
                          <Button
                            variant="ghost"
                            className="flex items-center gap-1 text-[#F87B1B] text-xs"
                            style={{
                              backgroundColor: "#F87B1B1A",
                            }}
                          >
                            <Edit className="w-3 h-3" />
                            Remark
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && surveys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6">
                    No surveys found for this tour
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-gray-600">
          Total Surveys: <span className="font-semibold">{surveys.length}</span>
        </div>
      </div>
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
