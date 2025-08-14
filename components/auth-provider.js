"use client"

import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }) {
  return (
    <SessionProvider
      // Reduce background sync to prevent unnecessary refreshes
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  )
}
