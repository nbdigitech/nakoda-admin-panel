import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getFirestore } from "firebase/firestore";

let app;
let auth;
let functions;
let db;

const initializeFirebase = () => {

  if (typeof window === "undefined") return;

  if (!app) {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    app = initializeApp(firebaseConfig);

    // 🔐 Auth
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence);

    // ☁️ Cloud Functions
    functions = getFunctions(app);

    // 🔥 Firestore
    db = getFirestore(app);

    // 🛡️ App Check (NO debug token in production)
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(
        process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY
      ),
      isTokenAutoRefreshEnabled: true,
    });
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

// Lazy getters
export const getFirebaseApp = () => {
  initializeFirebase();
  return app;
};

