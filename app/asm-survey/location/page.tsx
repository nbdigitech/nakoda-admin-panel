"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { getSurvey, getExpenses } from "@/services/masterData";

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
  const [totalExpense, setTotalExpense] = useState(0);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [routeLegs, setRouteLegs] = useState<any[]>([]);
  const [isRouteLoading, setIsRouteLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);

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

    const fetchExpenses = async () => {
      if (!tourId) return;
      try {
        const res: any = await getExpenses({ tourId, filter: 0 });
        const data = res?.data?.data || res?.data || res || [];
        if (Array.isArray(data)) {
          const total = data.reduce(
            (sum: number, item: any) => sum + (Number(item.amount) || 0),
            0,
          );
          setTotalExpense(total);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };
    fetchExpenses();
  }, [tourId]);

  useEffect(() => {
    if (locationData.length > 1) {
      if (!tourId) return;

      const cachedRoute = localStorage.getItem(`osrm_${tourId}`);
      if (cachedRoute) {
        try {
          const parsed = JSON.parse(cachedRoute);
          if (parsed && parsed.pathInfo && parsed.routeLegs) {
            setRoutePath(parsed.pathInfo);
            setRouteLegs(parsed.routeLegs);
            setIsRouteLoading(false);
            return;
          }
        } catch (e) {
          console.error("OSRM cache parse error", e);
        }
      }

      const fetchRoute = async () => {
        try {
          const coords = locationData
            .map((loc) => `${loc.longitude},${loc.latitude}`)
            .join(";");

          let fetchCoords = coords;
          if (locationData.length > 90) {
            fetchCoords = locationData
              .slice(0, 90)
              .map((loc) => `${loc.longitude},${loc.latitude}`)
              .join(";");
          }

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
            setRoutePath(pathInfo);
            setRouteLegs(route.legs || []);
            localStorage.setItem(
              `osrm_${tourId}`,
              JSON.stringify({ pathInfo, routeLegs: route.legs || [] }),
            );
          } else {
            setRoutePath(
              locationData.map((loc) => [loc.latitude, loc.longitude]),
            );
            setRouteLegs([]);
          }
        } catch (err) {
          console.error("OSRM Routing error", err);
          setRoutePath(
            locationData.map((loc) => [loc.latitude, loc.longitude]),
          );
          setRouteLegs([]);
        }
      };

      const timer = setTimeout(fetchRoute, 600);
      return () => clearTimeout(timer);
    } else {
      setRoutePath(locationData.map((loc) => [loc.latitude, loc.longitude]));
      setRouteLegs([]);
    }
  }, [locationData]);

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

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(2));
  };

  const calculateTotalDistance = (data: LocationData[]) => {
    if (routeLegs.length > 0) {
      const total = routeLegs.reduce((sum, leg) => sum + leg.distance, 0);
      return (total / 1000).toFixed(2);
    }
    let total = 0;
    for (let i = 0; i < data.length - 1; i++) {
      total += calculateDistance(
        data[i].latitude,
        data[i].longitude,
        data[i + 1].latitude,
        data[i + 1].longitude,
      );
    }
    return total.toFixed(2);
  };

  const queryLat = searchParams.get("lat");
  const queryLng = searchParams.get("lng");

  const center =
    queryLat && queryLng
      ? [parseFloat(queryLat), parseFloat(queryLng)]
      : locationData.length > 0
        ? [locationData[0].latitude, locationData[0].longitude]
        : [21.25, 81.63];

  const path =
    routePath.length > 0
      ? routePath
      : locationData.map((loc) => [loc.latitude, loc.longitude]);

  return (
    <DashboardLayout>
      <h2 className="text-lg font-bold mb-4">Survey Route</h2>

      <div className="bg-white rounded-xl shadow p-4 space-y-4">
        <div className="w-[50%] h-[300px] rounded-lg overflow-hidden">
          {isMounted && locationData.length > 0 && (
            <MapContainer
              center={center as any}
              zoom={8}
              className="w-full h-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <Polyline
                positions={path as any}
                pathOptions={{ color: "#F87B1B", weight: 4 }}
              />

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

        <div className="flex  mt-12 gap-12">
          <div className="flex overflow-x-auto gap-2 items-center text-sm text-gray-700 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent px-1">
            {locationData.map((loc, index) => {
              const distNext = routeLegs[index]
                ? (routeLegs[index].distance / 1000).toFixed(2)
                : index < locationData.length - 1
                  ? calculateDistance(
                      loc.latitude,
                      loc.longitude,
                      locationData[index + 1].latitude,
                      locationData[index + 1].longitude,
                    )
                  : 0;
              return (
                <div
                  key={loc.id}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <div className="flex flex-col items-center gap-1 min-w-[100px]">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-500 text-orange-700 font-bold text-xs ring-2 ring-white shadow-sm">
                      {index + 1}
                    </div>
                    <span
                      className="font-medium text-gray-800 max-w-[120px] truncate"
                      title={loc.location || `Stop ${index + 1}`}
                    >
                      {loc.location || `Stop ${index + 1}`}
                    </span>
                  </div>

                  {index < locationData.length - 1 && (
                    <div className="flex flex-col items-center px-2">
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mb-1 border border-gray-200">
                        {distNext} km
                      </span>
                      <div className="w-36 h-[2px] bg-gray-300 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-gray-300 border-b-[4px] border-b-transparent"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-6 bg-orange-50 px-6 py-2 rounded-xl border border-orange-100 shadow-sm min-w-max">
            <div className="flex flex-col items-start">
              <span className="font-semibold text-orange-800 text-[10px] uppercase tracking-wider">
                Total Distance
              </span>
              <span className="font-bold text-xl text-orange-600">
                {calculateTotalDistance(locationData)}{" "}
                <span className="text-xs font-medium">km</span>
              </span>
            </div>
          </div>
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
