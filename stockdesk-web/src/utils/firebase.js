import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAbgy0Sl0eZ9WzftR86iTDsi3aTs4LsKTM",
    authDomain: "stockdesk-pro.firebaseapp.com",
    projectId: "stockdesk-pro",
    storageBucket: "stockdesk-pro.firebasestorage.app",
    messagingSenderId: "931795711778",
    appId: "1:931795711778:web:7f79b6b94f51676756577b",
    measurementId: "G-PSHKFVPHNB"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);

// We need a secondary app specifically for creating client accounts
// so the active admin doesn't get automatically signed out by the Firebase SDK
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
export const secondaryAuth = getAuth(secondaryApp);
