import { useEffect, useState, useRef } from "react";
import { getFirestoreDB } from "@/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";

export function useGlobalNotifications(userId: string | null) {
  const [initTime] = useState(() => Date.now());
  const isLoaded = useRef({ notif: false, dist: false, inf: false });

  useEffect(() => {
    if (!userId) return;

    const db = getFirestoreDB();

    // 1. Listen to 'notifications' collection
    const notifQuery = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
      limit(5),
    );

    const unsubNotifs = onSnapshot(notifQuery, (snapshot) => {
      if (!isLoaded.current.notif) {
        isLoaded.current.notif = true;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        // Show toast for new docs, or modified docs that are still unread
        if (
          change.type === "added" ||
          (change.type === "modified" && !change.doc.data().read)
        ) {
          const data = change.doc.data();
          const timeToCheck = data.updatedAt || data.createdAt;
          const checkTime =
            timeToCheck?.toMillis?.() ||
            (timeToCheck ? new Date(timeToCheck).getTime() : 0);

          if (checkTime && checkTime > initTime) {
            toast.success(data.message, {
              position: "top-center",
              autoClose: 5000,
            });
          }
        }
      });
    });

    // 2. Listen to Distributor Orders
    const distOrderQuery = query(
      collection(db, "distributor_orders"),
      orderBy("createdAt", "desc"),
      limit(5),
    );
    const unsubDistOrders = onSnapshot(distOrderQuery, (snapshot) => {
      if (!isLoaded.current.dist) {
        isLoaded.current.dist = true;
        return;
      }
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added" || change.type === "modified") {
          const data = change.doc.data();
          const timeToSquare = data.updatedAt || data.createdAt;
          const checkTime =
            timeToSquare?.toMillis?.() ||
            (timeToSquare ? new Date(timeToSquare).getTime() : 0);

          if (checkTime && checkTime > initTime) {
            const orderId = data.orderId || change.doc.id;
            try {
              // Write a notification for this order using a predefined ID to prevent duplicates
              await setDoc(
                doc(db, "notifications", `orderD-${change.doc.id}`),
                {
                  title:
                    change.type === "added"
                      ? "New Dealer Order Received"
                      : "Dealer Order Updated",
                  message: `Order #${orderId} for ${data.totalQtyTons || 0} tons (Status: ${data.status || "Pending"})`,
                  type: "order",
                  read: false,
                  timestamp: serverTimestamp(),
                  createdAt: data.createdAt || new Date().toISOString(),
                  updatedAt: serverTimestamp(), // Always refresh updatedAt to trigger toast
                },
                { merge: true },
              );
            } catch (e) {
              console.error(e);
            }
          }
        }
      });
    });

    // 3. Listen to Influencer (Sub-dealer) Orders
    const infOrderQuery = query(
      collection(db, "influencer_orders"),
      orderBy("createdAt", "desc"),
      limit(5),
    );
    const unsubInfOrders = onSnapshot(infOrderQuery, (snapshot) => {
      if (!isLoaded.current.inf) {
        isLoaded.current.inf = true;
        return;
      }
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added" || change.type === "modified") {
          const data = change.doc.data();
          const timeToSquare = data.updatedAt || data.createdAt;
          const checkTime =
            timeToSquare?.toMillis?.() ||
            (timeToSquare ? new Date(timeToSquare).getTime() : 0);

          if (checkTime && checkTime > initTime) {
            const orderId = data.orderId || change.doc.id;
            try {
              // Write a notification for this order using a predefined ID
              await setDoc(
                doc(db, "notifications", `orderI-${change.doc.id}`),
                {
                  title:
                    change.type === "added"
                      ? "New Sub-Dealer Order Received"
                      : "Sub-Dealer Order Updated",
                  message: `Order #${orderId} for ${data.totalQtyTons || 0} tons (Status: ${data.status || "Pending"})`,
                  type: "order",
                  read: false,
                  timestamp: serverTimestamp(),
                  createdAt: data.createdAt || new Date().toISOString(),
                  updatedAt: serverTimestamp(),
                },
                { merge: true },
              );
            } catch (e) {
              console.error(e);
            }
          }
        }
      });
    });

    return () => {
      unsubNotifs();
      unsubDistOrders();
      unsubInfOrders();
    };
  }, [userId, initTime]);
}
