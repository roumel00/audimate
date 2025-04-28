"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PhoneCall, Users, Tag, List, FileText } from "lucide-react"

export default function ConsolePage() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Welcome, {session?.user?.name}</h1>
      <p className="text-gray-500 mb-8">Manage your Audimate account</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contacts
            </CardTitle>
            <CardDescription>Manage your contact list</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/console/contacts">
              <Button className="w-full">View Contacts</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </CardTitle>
            <CardDescription>Organize contacts with tags</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/console/tags">
              <Button className="w-full">Manage Tags</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Call Lists
            </CardTitle>
            <CardDescription>Create and manage call lists</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/console/call-lists">
              <Button className="w-full">View Call Lists</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Scripts
            </CardTitle>
            <CardDescription>Create and edit call scripts</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/console/scripts">
              <Button className="w-full">Manage Scripts</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5" />
              Call History
            </CardTitle>
            <CardDescription>View past calls and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/console/calls">
              <Button className="w-full">View History</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
