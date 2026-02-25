import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { getFirestoreDB, getFirebaseStorage } from "@/firebase";

const uploadFileToStorage = async (dataUrl: string, path: string) => {
  if (!dataUrl) return null;
  if (dataUrl.startsWith("http")) return dataUrl; // Already a URL
  try {
    const storage = getFirebaseStorage();
    const storageRef = ref(storage, path);
    await uploadString(storageRef, dataUrl, "data_url");
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading to storage:", error);
    return null;
  }
};

export const getDealers = async () => {
  const db = getFirestoreDB();
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("role", "==", "dealer"));
  const querySnapshot = await getDocs(q);

  const dealers: any[] = [];
  querySnapshot.forEach((doc) => {
    dealers.push({ id: doc.id, ...doc.data() });
  });

  return dealers;
};

export const createDealer = async (dealerData: any) => {
  const db = getFirestoreDB();
  const dealerRef = doc(collection(db, "users"));
  const dealerId = dealerRef.id;

  const phone = dealerData.phoneNumber;
  const updates: any = {};

  if (dealerData.logoBase64)
    updates.logoUrl = await uploadFileToStorage(
      dealerData.logoBase64,
      `dealers/${phone}/logo-${Date.now()}`,
    );
  if (dealerData.gstBase64)
    updates.gstUrl = await uploadFileToStorage(
      dealerData.gstBase64,
      `dealers/${phone}/gst-${Date.now()}.pdf`,
    );
  if (dealerData.pancardBase64)
    updates.pancardUrl = await uploadFileToStorage(
      dealerData.pancardBase64,
      `dealers/${phone}/pancard-${Date.now()}`,
    );
  if (dealerData.aadhaarBase64)
    updates.aadhaarPath = await uploadFileToStorage(
      dealerData.aadhaarBase64,
      `dealers/${phone}/aadhaar-${Date.now()}`,
    );

  const payload = {
    ...dealerData,
    ...updates,
    role: "dealer",
    status: "pending",
    createdAt: new Date(),
  };

  // Remove base64 fields before saving
  delete payload.logoBase64;
  delete payload.gstBase64;
  delete payload.pancardBase64;
  delete payload.aadhaarBase64;

  await setDoc(dealerRef, payload);

  return dealerId;
};

export const updateDealer = async (dealerId: string, dealerData: any) => {
  const db = getFirestoreDB();
  const phone = dealerData.phoneNumber || dealerId;
  const updates: any = {};

  if (dealerData.logoBase64 && !dealerData.logoBase64.startsWith("http"))
    updates.logoUrl = await uploadFileToStorage(
      dealerData.logoBase64,
      `dealers/${phone}/logo-${Date.now()}`,
    );
  if (dealerData.gstBase64 && !dealerData.gstBase64.startsWith("http"))
    updates.gstUrl = await uploadFileToStorage(
      dealerData.gstBase64,
      `dealers/${phone}/gst-${Date.now()}.pdf`,
    );
  if (dealerData.pancardBase64 && !dealerData.pancardBase64.startsWith("http"))
    updates.pancardUrl = await uploadFileToStorage(
      dealerData.pancardBase64,
      `dealers/${phone}/pancard-${Date.now()}`,
    );
  if (dealerData.aadhaarBase64 && !dealerData.aadhaarBase64.startsWith("http"))
    updates.aadhaarPath = await uploadFileToStorage(
      dealerData.aadhaarBase64,
      `dealers/${phone}/aadhaar-${Date.now()}`,
    );

  const payload = {
    ...dealerData,
    ...updates,
  };

  delete payload.logoBase64;
  delete payload.gstBase64;
  delete payload.pancardBase64;
  delete payload.aadhaarBase64;

  const dealerRef = doc(db, "users", dealerId);
  await updateDoc(dealerRef, payload);
};

export const deleteDealer = async (dealerId: string) => {
  const db = getFirestoreDB();
  const dealerRef = doc(db, "users", dealerId);
  await deleteDoc(dealerRef);
};
