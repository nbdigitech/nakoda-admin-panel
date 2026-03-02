import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

let app;
let auth;
let functions;
let db;
let storage;

const initializeFirebase = () => {
  if (getApps().length > 0) {
    app = getApp();
  } else {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    app = initializeApp(firebaseConfig);
  }

  // 🔐 Auth
  if (!auth) {
    auth = getAuth(app);
    if (typeof window !== "undefined") {
      setPersistence(auth, browserLocalPersistence);
    }
  }

  // ☁️ Cloud Functions
  if (!functions) functions = getFunctions(app);

  // 🔥 Firestore
  if (!db) db = getFirestore(app);

  // 📦 Storage
  if (!storage) storage = getStorage(app);

  // 🛡️ App Check
  if (typeof window !== "undefined" && !window.appCheckInitialized) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    try {
        initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(
                process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY
            ),
            isTokenAutoRefreshEnabled: true,
        });
        window.appCheckInitialized = true;
    } catch (err) {
        console.warn("AppCheck failed to initialize:", err);
    }
  }
};

export const getFirebaseAuth = () => {
  initializeFirebase();
  return auth;
};

export const getFirebaseFunctions = () => {
  initializeFirebase();
  return functions;
};

export const getFirestoreDB = () => {
  initializeFirebase();
  return db;
};

export const getFirebaseStorage = () => {
  initializeFirebase();
  return storage;
};

// Lazy getters
export const getFirebaseApp = () => {
  initializeFirebase();
  return app;
};

