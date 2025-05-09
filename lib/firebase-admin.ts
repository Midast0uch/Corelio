// This file is for server-side Firebase operations (if needed)
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

// Check if Firebase Admin has already been initialized
const apps = getApps()

// Service account credentials for server-side operations
// This should be a JSON object with your service account credentials
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined

// Initialize Firebase Admin for server-side operations
const firebaseAdmin =
  apps.length === 0
    ? initializeApp({
        credential: serviceAccount ? cert(serviceAccount) : undefined,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      })
    : apps[0]

// Export Firestore and Auth for server-side operations
const adminDb = getFirestore()
const adminAuth = getAuth()

export { adminDb, adminAuth }
