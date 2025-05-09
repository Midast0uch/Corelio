"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react" // Import useRef
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  updateProfile,
  Auth // Import Auth type
} from "firebase/auth"
import { getFirebaseClient } from "@/lib/firebase-client"

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false); // Use useRef to track initialization
  const authInstance = useRef<Auth | null>(null); // Use useRef to store auth instance

  // Initialize Firebase auth and listener on the client side only
  useEffect(() => {
    if (typeof window !== "undefined" && !initialized.current) {
      // This will only run in the browser
      const { auth } = getFirebaseClient()

      if (auth) {
        authInstance.current = auth; // Store auth instance in ref
        const unsubscribe = onAuthStateChanged(authInstance.current, (user) => { // Use instance from ref
          setUser(user)
          setLoading(false)
        })

        initialized.current = true; // Mark as initialized
        return () => unsubscribe()
      } else {
        // If auth is not available, set loading to false
        setLoading(false)
      }
    }
  }, []) // Empty dependency array to run only once on mount

  // Authentication functions - now using the auth instance from useRef
  const signInWithEmail = async (email: string, password: string) => {
    if (!authInstance.current) throw new Error("Authentication not initialized")

    try {
      await signInWithEmailAndPassword(authInstance.current, email, password)
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code))
    }
  }

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (!authInstance.current) throw new Error("Authentication not initialized")

    try {
      const userCredential = await createUserWithEmailAndPassword(authInstance.current, email, password)
      // Update the user's profile with the display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        })
      }
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code))
    }
  }

  const signInWithGoogle = async () => {
    if (!authInstance.current) throw new Error("Authentication not initialized")

    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(authInstance.current, provider)
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code))
    }
  }

  const signOut = async () => {
    if (!authInstance.current) throw new Error("Authentication not initialized")

    try {
      await firebaseSignOut(authInstance.current)
    } catch (error: any) {
      throw new Error("Failed to sign out")
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// Helper function to get user-friendly error messages
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Invalid email address"
    case "auth/user-disabled":
      return "This account has been disabled"
    case "auth/user-not-found":
      return "No account found with this email"
    case "auth/wrong-password":
      return "Incorrect password"
    case "auth/email-already-in-use":
      return "Email already in use"
    case "auth/weak-password":
      return "Password is too weak"
    case "auth/popup-closed-by-user":
      return "Sign in was cancelled"
    case "auth/cancelled-popup-request":
      return "Sign in was cancelled"
    case "auth/popup-blocked":
      return "Pop-up was blocked by your browser"
    default:
      return "An error occurred during authentication"
  }
}
