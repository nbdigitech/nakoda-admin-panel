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

export const getSubDealers = async () => {
  const db = getFirestoreDB();
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("role", "==", "influencer"));
  const querySnapshot = await getDocs(q);

  const subDealers: any[] = [];
  querySnapshot.forEach((doc) => {
    subDealers.push({ id: doc.id, ...doc.data() });
  });

  return subDealers;
};

export const updateSubDealer = async (
  subDealerId: string,
  subDealerData: any,
) => {
  const db = getFirestoreDB();
  const phone = subDealerData.phoneNumber || subDealerId;
  const updates: any = {};

  if (subDealerData.logoBase64 && !subDealerData.logoBase64.startsWith("http"))
    updates.logoUrl = await uploadFileToStorage(
      subDealerData.logoBase64,
      `sub-dealers/${phone}/logo-${Date.now()}`,
    );
  if (subDealerData.gstBase64 && !subDealerData.gstBase64.startsWith("http"))
    updates.gstUrl = await uploadFileToStorage(
      subDealerData.gstBase64,
      `sub-dealers/${phone}/gst-${Date.now()}.pdf`,
    );
  if (
    subDealerData.pancardBase64 &&
    !subDealerData.pancardBase64.startsWith("http")
  )
    updates.pancardUrl = await uploadFileToStorage(
      subDealerData.pancardBase64,
      `sub-dealers/${phone}/pancard-${Date.now()}`,
    );
  if (
    subDealerData.aadhaarBase64 &&
    !subDealerData.aadhaarBase64.startsWith("http")
  )
    updates.aadhaarPath = await uploadFileToStorage(
      subDealerData.aadhaarBase64,
      `sub-dealers/${phone}/aadhaar-${Date.now()}`,
    );

  const payload = {
    ...subDealerData,
    ...updates,
  };

  delete payload.logoBase64;
  delete payload.gstBase64;
  delete payload.pancardBase64;
  delete payload.aadhaarBase64;

  const subDealerRef = doc(db, "users", subDealerId);
  await updateDoc(subDealerRef, payload);
};

export const deleteSubDealer = async (subDealerId: string) => {
  const db = getFirestoreDB();
  const subDealerRef = doc(db, "users", subDealerId);
  await deleteDoc(subDealerRef);
};
