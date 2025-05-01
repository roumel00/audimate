"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { CallListsTable } from "@/components/call-lists/call-lists-table"
import { CreateCallListDialog } from "@/components/dialogs/create-call-list-dialog"

export default function CallListsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [callLists, setCallLists] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [error, setError] = useState("")

  // Fetch all call lists
  const fetchCallLists = async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await fetch("/api/call-lists")

      if (!response.ok) {
        throw new Error("Failed to fetch call lists")
      }

      const data = await response.json()
      setCallLists(data.callLists)
    } catch (error) {
      console.error("Error fetching call lists:", error)
      setError("Failed to load call lists. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load call lists. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (session) {
      fetchCallLists()
    }
  }, [session])

  // Handle deleting a call list
  const handleDeleteCallList = async (callListId) => {
    try {
      const response = await fetch(`/api/call-lists/${callListId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to delete call list")
      }

      // Remove call list from the list
      setCallLists((prevCallLists) => prevCallLists.filter((callList) => callList.id !== callListId))

      toast({
        title: "Call list deleted",
        description: "The call list has been deleted successfully.",
      })
    } catch (err) {
      console.error("Error deleting call list:", err)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
      throw err
    }
  }

  // Handle call list creation
  const handleCallListCreated = (callList) => {
    setCallLists((prev) => [...prev, callList])
    toast({
      title: "Call list created",
      description: `Call list "${callList.name}" has been created successfully.`,
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Call Lists</h1>
        <p className="text-muted-foreground mt-1">Manage your AI calling lists</p>
      </div>

      <div className="mb-6">
        <CallListsTable
          callLists={callLists}
          onDelete={handleDeleteCallList}
          onCreateNew={() => setIsCreateDialogOpen(true)}
          isLoading={isLoading}
        />
      </div>

      <CreateCallListDialog
        isOpen={isCreateDialogOpen}
        setIsOpen={setIsCreateDialogOpen}
        onCallListCreated={handleCallListCreated}
      />
    </div>
  )
}
