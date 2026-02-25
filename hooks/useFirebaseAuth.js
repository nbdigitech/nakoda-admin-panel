"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDB } from "@/firebase";

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirestoreDB();
    
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Fetch additional user details from Firestore
          let foundUser = null;

          // 1) Try fetching where document ID is the UID
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            foundUser = { id: docSnap.id, ...docSnap.data() };
          } else {
            // 2) Try querying where a 'uid' field matches the UID
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("uid", "==", firebaseUser.uid));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const uDoc = querySnapshot.docs[0];
              foundUser = { id: uDoc.id, ...uDoc.data() };
            } else if (firebaseUser.email) {
              // 3) Try querying where 'email' matches
              const emailQ = query(usersRef, where("email", "==", firebaseUser.email));
              const emailSnap = await getDocs(emailQ);
              if (!emailSnap.empty) {
                const eDoc = emailSnap.docs[0];
                foundUser = { id: eDoc.id, ...eDoc.data() };
              }
            }
          }
          
          setUserData(foundUser);
        } catch (err) {
          console.error("Failed to fetch user data for auth hook:", err);
        }
      } else {
        setUserData(null);
      }
      setAuthReady(true);
    });

    return () => unsub();
  }, []);

  return { user, userData, authReady };
};
