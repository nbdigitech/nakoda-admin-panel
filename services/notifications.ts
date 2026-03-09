import { getFirestoreDB } from "@/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import callFunction from "./firebaseFunctions";

export const addNotification = async (
  title: string,
  message: string,
  type:
    | "order"
    | "dealer"
    | "sub-dealer"
    | "staff"
    | "system"
    | "alert"
    | "rate",
) => {
  try {
    const db = getFirestoreDB();
    await addDoc(collection(db, "notifications"), {
      title,
      message,
      type,
      read: false,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
      updatedAt: serverTimestamp(), // Added for modification tracking
    });
  } catch (error) {
    console.error("Failed to add notification:", error);
  }
};

export const sendNotification = async (
  fcmToken: string,
  title: string,
  body: string,
) => {
  try {
    if (!fcmToken) return;
    await callFunction("sendNotification", {
      token: fcmToken,
      title,
      body,
    });
  } catch (error) {
    console.error("Failed to send FCM notification:", error);
  }
};

export const sendFcmNotificationById = async (
  userId: string,
  title: string,
  body: string,
) => {
  try {
    if (!userId) return;
    const db = getFirestoreDB();
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      const token = data.fcmToken || data.token;
      if (token) {
        await sendNotification(token, title, body);
      }
    }
  } catch (error) {
    console.error("Error in sendFcmNotificationById:", error);
  }
};
