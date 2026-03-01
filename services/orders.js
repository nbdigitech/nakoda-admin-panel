import { getFirestoreDB } from "@/firebase";
import { collection, getDocs, query, where, doc, getDoc, orderBy, updateDoc, addDoc } from "firebase/firestore";

export const getInfluencerOrders = async () => {
    try {
        const db = getFirestoreDB();
        const ordersRef = collection(db, "influencer_orders");
        // Remove orderBy temporarily to avoid missing index errors
        const querySnapshot = await getDocs(ordersRef);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {

        console.error("Error fetching influencer orders:", error);
        throw error;
    }
};

export const getInfluencerOrderFulfillments = async () => {
    try {
        const db = getFirestoreDB();
        const fulfillmentsRef = collection(db, "influencer_orders_fulfillments");
        const querySnapshot = await getDocs(fulfillmentsRef);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching fulfillments:", error);
        throw error;
    }
};

export const getDistributorOrderFulfillments = async (distributorOrderId) => {
    try {
        const db = getFirestoreDB();
        const fulfillmentsRef = collection(db, "distributor_orders_fulfillments");
        // Fetch all and filter client-side to handle the complex OR condition requested
        const querySnapshot = await getDocs(fulfillmentsRef);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching fulfillments:", error);
        throw error;
    }
};

export const getDistributorOrders = async () => {
    try {
        const db = getFirestoreDB();
        const ordersRef = collection(db, "distributor_orders");
        const querySnapshot = await getDocs(ordersRef);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching distributor orders:", error);
        throw error;
    }
};

export const updateOrder = async (collectionName, orderId, data) => {
    try {
        const db = getFirestoreDB();
        const orderRef = doc(db, collectionName, orderId);
        await updateDoc(orderRef, data);
        return true;
    } catch (error) {
        console.error("Error updating order:", error);
        throw error;
    }
};

export const createFulfillment = async (collectionName, data) => {
    try {
        const db = getFirestoreDB();
        const fulfillmentsRef = collection(db, collectionName);
        await addDoc(fulfillmentsRef, data);
        return true;
    } catch (error) {
        console.error("Error creating fulfillment:", error);
        throw error;
    }
};

export const fetchUsers = async () => {
    try {
        const db = getFirestoreDB();
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        
        const usersMap = {};
        querySnapshot.forEach(doc => {
            const data = doc.data();
            usersMap[doc.id] = {
                name: data.name || data.fullName || "No Name",
                distributorName: data.distributorName || ""
            };
        });
        return usersMap;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};
