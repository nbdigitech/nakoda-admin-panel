import { getFirestoreDB } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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
    });
  } catch (error) {
    console.error("Failed to add notification:", error);
  }
};
