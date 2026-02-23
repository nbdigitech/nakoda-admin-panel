import { getFirestoreDB } from "@/firebase";
import { collection, getDocs, query, where, doc, getDoc, orderBy } from "firebase/firestore";

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

export const getInfluencerOrderFulfillments = async (influencerOrderId) => {
    try {
        const db = getFirestoreDB();
        const fulfillmentsRef = collection(db, "influencer_order_fulfillments");
        const q = query(
            fulfillmentsRef, 
            where("influencerOrderId", "==", influencerOrderId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        
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
