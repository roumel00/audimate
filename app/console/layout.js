"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { ConsoleSidebar } from "@/components/console-sidebar"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function ConsoleLayout({ children }) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/login?callbackUrl=/console")
    },
  })

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ConsoleSidebar />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
