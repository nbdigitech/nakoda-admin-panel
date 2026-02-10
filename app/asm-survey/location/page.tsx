"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { getSurvey } from "@/services/masterData";

// 🔥 Firestore

// 🗺 Dynamic Leaflet imports (SSR SAFE)
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false },
);

interface LocationData {
  id: string;
  latitude: number;
  longitude: number;
  location?: string;
  personName?: string;
}

function LocationMap() {
  const searchParams = useSearchParams();
  const tourId = searchParams.get("tourId");

  const [isMounted, setIsMounted] = useState(false);
  const [locationData, setLocationData] = useState<LocationData[]>([]);

  /* ================= CLIENT ONLY INIT ================= */
  useEffect(() => {
    setIsMounted(true);

    // ✅ Fix Leaflet default icon (CLIENT ONLY)
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  /* ================= FETCH SURVEY LOCATIONS ================= */
  useEffect(() => {
    const cachedLocs = localStorage.getItem(`locs_${tourId}`);
    if (cachedLocs) {
      setLocationData(JSON.parse(cachedLocs));
    }

    const fetchLocations = async () => {
      if (!tourId) return;

      try {
        const res: any = await getSurvey({ tourId });
        if (res && res.data) {
          const mappedData = res.data
            .map((s: any) => ({
              id: s.id,
              latitude: s.latLong?.latitude,
              longitude: s.latLong?.longitude,
              location: s.location || s.shopName,
              personName: s.name,
            }))
            .filter((loc: any) => loc.latitude && loc.longitude);

          setLocationData(mappedData);
          localStorage.setItem(`locs_${tourId}`, JSON.stringify(mappedData));
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, [tourId]);

  /* ================= NUMBERED ICON ================= */
  const getNumberedIcon = (number: number) => {
    if (typeof window === "undefined") return undefined;
    const L = require("leaflet");

    return L.divIcon({
      html: `
        <div style="
          background:#F87B1B;
          color:white;
          width:26px;
          height:26px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:bold;
          font-size:13px;
          border:2px solid white;
        ">
          ${number}
        </div>
      `,
      className: "",
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
  };

  /* ================= MAP DATA ================= */
  const queryLat = searchParams.get("lat");
  const queryLng = searchParams.get("lng");

  const center =
    queryLat && queryLng
      ? [parseFloat(queryLat), parseFloat(queryLng)]
      : locationData.length > 0
        ? [locationData[0].latitude, locationData[0].longitude]
        : [21.25, 81.63];

  const path = locationData.map((loc) => [loc.latitude, loc.longitude]);

  return (
    <DashboardLayout>
      <h2 className="text-lg font-bold mb-4">Survey Route</h2>

      <div className="bg-white rounded-xl shadow p-4 space-y-4">
        <div className="w-full h-[300px] rounded-lg overflow-hidden">
          {isMounted && locationData.length > 0 && (
            <MapContainer
              center={center as any}
              zoom={8}
              className="w-full h-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* 🔵 CONNECTING LINE */}
              <Polyline
                positions={path as any}
                pathOptions={{ color: "#F87B1B", weight: 4 }}
              />

              {/* 🔴 NUMBERED POINTS */}
              {locationData.map((loc, index) => (
                <Marker
                  key={loc.id}
                  position={[loc.latitude, loc.longitude]}
                  icon={getNumberedIcon(index + 1)}
                />
              ))}
            </MapContainer>
          )}
        </div>

        {/* 📍 LOCATION NAMES */}
        <div className="flex justify-between text-sm text-gray-700">
          {locationData.map((loc, index) => (
            <div key={loc.id} className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#F87B1B] rounded-full" />
              <span>{loc.location || `Stop ${index + 1}`}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function LocationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LocationMap />
    </Suspense>
  );
}
