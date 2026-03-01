import callFunction from "./firebaseFunctions";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { getFirebaseApp } from "@/firebase";

const db = getFirestore(getFirebaseApp());

export const getDesignation = () => callFunction("getDesignation");
export const getCity = (payload) => callFunction("getCity", payload);
export const deleteCity = (payload) => callFunction("deleteCity", payload);
export const addCity = (payload) => callFunction("addCity", payload);

export const getInfluencerCategory = () => callFunction("getInfluencerCategory");
export const addInfluencerCategory = (payload) => callFunction("addInfluencerCategory", payload);
export const deleteInfluencerCategory = (payload) => callFunction("deleteInfluencerCategory", payload);

export const getState = () => callFunction("getState");
export const addState = (payload) => callFunction("addState", payload);
export const deleteState = (payload) => callFunction("deleteState", payload);

export const getDistrict = (payload) => callFunction("getDistrict", payload);
export const addDistrict = (payload) => callFunction("addDistrict", payload);
export const deleteDistrict = (payload) => callFunction("deleteDistrict", payload);

export const getUnit = () => callFunction("getUnit");
export const addUnit = (payload) => callFunction("addUnit", payload);
export const deleteUnit = (payload) => callFunction("deleteUnit", payload);

export const addDesignation = (payload) => callFunction("addDesignation", payload);
export const deleteDesignation = (payload) => callFunction("deleteDesignation", payload);

// Dealer Functions
export const createDealerByPhone = (payload) => callFunction("createDealerByPhone", payload);
export const checkUserBeforeLogin = (payload) => callFunction("checkUserBeforeLogin", payload);

// ASM Related Functions
export const getTour = () => callFunction("getTour");
export const getSurvey = (payload) => callFunction("getSurvey", payload);
export const getExpenses = (payload) => callFunction("getExpenses", payload);
export const changeExpenseStatus = (payload) => callFunction("changeExpenseStatus", payload);

// Validity Period Functions
export const getValidityPeriod = async () => {
    const q = query(collection(db, "validity_period"), orderBy("validityPeriod", "asc"));
    const snapshot = await getDocs(q);
    return { data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
};

export const addValidityPeriod = async (payload) => {
    if (payload.id) {
        const docRef = doc(db, "validity_period", payload.id);
        await updateDoc(docRef, { 
            validityPeriod: Number(payload.validityPeriod), 
            status: payload.status || "active",
            updatedAt: serverTimestamp()
        });
        return { id: payload.id };
    } else {
        const docRef = await addDoc(collection(db, "validity_period"), {
            validityPeriod: Number(payload.validityPeriod),
            status: payload.status || "active",
            createdAt: serverTimestamp()
        });
        return { id: docRef.id };
    }
};

export const deleteValidityPeriod = async (payload) => {
    await deleteDoc(doc(db, "validity_period", payload.docId));
    return { success: true };
};
