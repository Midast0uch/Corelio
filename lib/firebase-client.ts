// This file is specifically for client-side Firebase usage
import { initializeApp, getApps, FirebaseApp } from "firebase/app" // Import FirebaseApp type
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZPAZPpUQnMau02S9jsB56tRF1n4gporI",
  authDomain: "coreilo.firebaseapp.com",
  projectId: "coreilo",
  storageBucket:"coreilo.firebasestorage.app",
  messagingSenderId: "185321003409",
  appId: "1:185321003409:web:725d3feaea31383cb9a230",
}

// Initialize Firebase only once and store the instances
let firebaseAppInstance: FirebaseApp | null = null; // Use explicit type and initialize to null
let authInstance: Auth | null = null; // Use explicit type and initialize to null
let dbInstance: Firestore | null = null; // Use explicit type and initialize to null

export function getFirebaseClient(): { auth: Auth | null; db: Firestore | null } {
  if (typeof window === "undefined") {
    return { auth: null, db: null }
  }

  if (!firebaseAppInstance) { // Check if firebaseAppInstance is null
    if (!getApps().length) {
      firebaseAppInstance = initializeApp(firebaseConfig);
    } else {
      firebaseAppInstance = getApps()[0];
    }
    authInstance = getAuth(firebaseAppInstance);
    dbInstance = getFirestore(firebaseAppInstance);

    // Initialize emulators if in development (optional)
    if (process.env.NODE_ENV === "development") {
      // Uncomment these lines if you're using Firebase emulators
      // connectAuthEmulator(authInstance, 'http://localhost:9099');
      // connectFirestoreEmulator(dbInstance, 'localhost', 8080);
    }
  }

  return {
    auth: authInstance,
    db: dbInstance
  }
}