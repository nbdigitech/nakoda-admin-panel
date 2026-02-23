"use client";

import { useEffect, useState } from "react";
import UpdateRateDrawer from "@/components/dashboard/update-rate-drawer";
import { getFirestoreDB } from "@/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function TodayRateCard() {
  const [rateData, setRateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestoreDB();
    if (!db) return;

    const q = query(
      collection(db, "daily_price"),
      orderBy("createdAt", "desc"),
      limit(1),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          setRateData({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        } else {
          setRateData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching daily price:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center rounded-lg px-6 py-6 -mt-2 bg-[#F87B1B1A]">
        <Loader2 className="w-6 h-6 animate-spin text-[#F87B1B]" />
      </div>
    );
  }

  const newPrice = rateData?.newPrice || 0;
  const oldPrice = rateData?.oldPrice || 0;
  const difference = newPrice - oldPrice;
  const isUp = difference >= 0;

  // Try to use the stored date or fallback to today
  const dateStr = rateData?.date ? new Date(rateData.date) : new Date();

  return (
    <div
      className="w-full flex items-center justify-between rounded-lg px-6 py-3 -mt-2"
      style={{ backgroundColor: "#F87B1B1A" }}
    >
      {/* Left Content */}
      <div className="flex items-center gap-8 ">
        <div>
          <h3 className="text-[18px] pb-1 font-semibold text-[#F87B1B]">
            Today Rate
          </h3>
          <p className="text-sm font-medium ">
            Rs. {newPrice.toLocaleString()} MT •{" "}
            {format(dateStr, "dd MMM yyyy")}
          </p>
        </div>

        {rateData && (
          <div className="flex items-center gap-1.5 ml-14">
            <span
              className={`text-[15px] font-bold ${isUp ? "text-[#0A8F3E]" : "text-red-500"}`}
            >
              ₹ {Math.abs(difference)}
            </span>

            <span
              className={`text-[12px] leading-none ${isUp ? "text-[#0A8F3E]" : "text-red-500"}`}
            >
              {isUp ? "▲" : "▼"}
            </span>
          </div>
        )}
      </div>

      {/* Button */}
      <UpdateRateDrawer
        currentRate={newPrice}
        trigger={
          <button
            className="text-white text-sm font-semibold px-5 py-2 rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#F87B1B" }}
          >
            + Update Rate
          </button>
        }
      />
    </div>
  );
}
