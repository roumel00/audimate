"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserIcon } from "lucide-react"

export function AuthStatus() {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  if (isLoading) {
    return <div className="animate-pulse h-10 w-24 bg-gray-200 rounded-md"></div>
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          <span className="font-medium">{session.user.name}</span>
        </div>
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/auth/login">
        <Button variant="outline">Sign In</Button>
      </Link>
      <Link href="/auth/signup">
        <Button>Sign Up</Button>
      </Link>
    </div>
  )
}
