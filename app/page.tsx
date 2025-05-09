"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import LoginPage from "@/components/login-page"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only run this effect on the client after authentication state is loaded
    if (!loading && isClient) {
      if (user) {
        router.push("/onboarding") // Or wherever the next step after login is
      }
    }
  }, [user, loading, router, isClient]) // Add isClient to dependency array

  // Render a loading state on the server and while authentication is loading on the client
  // This prevents rendering the login page if the user is actually logged in, avoiding mismatch.
  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // If not loading and no user, render the login page
  if (!user) {
     return <LoginPage />;
  }

  // If not loading and user exists, and we haven't redirected yet (shouldn't happen with the effect),
  // you might render a fallback or null. But the effect should handle the redirection.
  return null;
}
