import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { getFirestoreDB, getFirebaseStorage } from "@/firebase";

const uploadFileToStorage = async (dataUrl, path) => {
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

export const getRewards = async () => {
  try {
    const db = getFirestoreDB();
    const rewardsRef = collection(db, "rewards");
    const querySnapshot = await getDocs(rewardsRef);
    const rewards = [];
    querySnapshot.forEach((doc) => {
      rewards.push({ id: doc.id, ...doc.data() });
    });
    return rewards;
  } catch (error) {
    console.error("Error fetching rewards:", error);
    throw error;
  }
};

export const addReward = async (rewardData) => {
  try {
    const db = getFirestoreDB();
    const rewardsRef = collection(db, "rewards");
    
    let imagePath = "";
    if (rewardData.imagePath && !rewardData.imagePath.startsWith("http")) {
      imagePath = await uploadFileToStorage(
        rewardData.imagePath,
        `rewards/reward-${Date.now()}`
      );
    } else {
        imagePath = rewardData.imagePath;
    }

    const payload = {
      title: rewardData.title,
      description: rewardData.description,
      category: rewardData.category,
      requiredPoints: Number(rewardData.requiredPoints),
      expiryDate: rewardData.expiryDate, // Should be converted to timestamp if it's a date string
      status: rewardData.status || "active",
      imagePath: imagePath,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(rewardsRef, payload);
    return docRef.id;
  } catch (error) {
    console.error("Error adding reward:", error);
    throw error;
  }
};

export const updateReward = async (rewardId, rewardData) => {
  try {
    const db = getFirestoreDB();
    const rewardRef = doc(db, "rewards", rewardId);
    
    const updates = { ...rewardData };
    
    if (rewardData.imagePath && !rewardData.imagePath.startsWith("http")) {
        updates.imagePath = await uploadFileToStorage(
            rewardData.imagePath,
            `rewards/reward-${Date.now()}`
        );
    }
    
    if (rewardData.requiredPoints) {
        updates.requiredPoints = Number(rewardData.requiredPoints);
    }

    await updateDoc(rewardRef, updates);
  } catch (error) {
    console.error("Error updating reward:", error);
    throw error;
  }
};

export const deleteReward = async (rewardId) => {
  try {
    const db = getFirestoreDB();
    const rewardRef = doc(db, "rewards", rewardId);
    await deleteDoc(rewardRef);
  } catch (error) {
    console.error("Error deleting reward:", error);
    throw error;
  }
};

export const getRewardsHistory = async () => {
  try {
    const db = getFirestoreDB();
    const historyRef = collection(db, "rewards_history");
    const querySnapshot = await getDocs(historyRef);
    const history = [];
    querySnapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() });
    });
    return history;
  } catch (error) {
    console.error("Error fetching rewards history:", error);
    throw error;
  }
};

export const updateRewardRedemptionStatus = async (historyId, status) => {
  try {
    const db = getFirestoreDB();
    const historyRef = doc(db, "rewards_history", historyId);
    await updateDoc(historyRef, { 
        status: status,
        updatedAt: serverTimestamp() 
    });
  } catch (error) {
    console.error("Error updating redemption status:", error);
    throw error;
  }
};
