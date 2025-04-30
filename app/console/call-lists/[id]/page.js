"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ContactsManagement } from "@/components/call-lists/contacts-management"
import { InstructionDetails } from "@/components/call-lists/instruction-details"
import { PhoneCallDetails } from "@/components/call-lists/phone-call-details"

export default function CallListDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const [callList, setCallList] = useState(null)
  const [contacts, setContacts] = useState([])
  const [instruction, setInstruction] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedContact, setSelectedContact] = useState(null)
  const [rightSideView, setRightSideView] = useState("instruction") // Either "instruction" or "call"

  // Fetch call list details
  const fetchCallListDetails = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch(`/api/call-lists/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/console/call-lists")
          return
        }
        throw new Error("Failed to fetch call list details")
      }

      const data = await response.json()
      setCallList(data.callList)
      setContacts(data.callList.contacts || [])
      setInstruction(data.callList.instruction || null)
    } catch (error) {
      console.error("Error fetching call list details:", error)
      setError("Failed to load call list details. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load call list details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (session && id) {
      fetchCallListDetails()
    }
  }, [session, id])

  // Handle adding contacts to call list
  const handleAddContacts = async (contactIds) => {
    try {
      const response = await fetch(`/api/call-lists/${id}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactIds }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to add contacts")
      }

      const data = await response.json()

      // Refresh call list details
      fetchCallListDetails()

      toast({
        title: "Contacts added",
        description: `${data.addedCount} contacts added to the call list.`,
      })
    } catch (error) {
      console.error("Error adding contacts:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  // Handle removing contacts from call list
  const handleRemoveContacts = async (contactIds) => {
    try {
      const response = await fetch(`/api/call-lists/${id}/contacts`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactIds }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to remove contacts")
      }

      const data = await response.json()

      // Refresh call list details
      fetchCallListDetails()

      toast({
        title: "Contacts removed",
        description: `${data.removedCount} contacts removed from the call list.`,
      })
    } catch (error) {
      console.error("Error removing contacts:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  // Handle instruction change
  const handleInstructionChanged = async () => {
    // Refresh call list details to get the updated instruction
    fetchCallListDetails()
  }

  // Handle contact selection
  const handleContactSelect = (contact) => {
    setSelectedContact(contact)
    setRightSideView("call")
  }

  // Handle back to instruction view
  const handleBackToInstruction = () => {
    setRightSideView("instruction")
    setSelectedContact(null)
  }

  // Add a function to handle call completion that updates both components
  const handleCallCompleted = (contactId, phoneCall) => {
    if (selectedContact && selectedContact.id === contactId) {
      setSelectedContact({ ...selectedContact, _forceRefresh: Date.now() })
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" className="mb-4" onClick={() => router.push("/console/call-lists")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Call Lists
        </Button>

        <h1 className="text-3xl font-bold">{isLoading ? "Loading..." : callList?.name}</h1>
        <p className="text-muted-foreground mt-1">Manage contacts and view details for this call list</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1">
          <ContactsManagement
            callList={callList}
            contacts={contacts}
            instruction={instruction}
            onAddContacts={handleAddContacts}
            onRemoveContacts={handleRemoveContacts}
            isLoading={isLoading}
            onContactSelect={handleContactSelect}
            onCallCompleted={handleCallCompleted}
          />
        </div>

        <div className="lg:col-span-1">
          {rightSideView === "instruction" ? (
            <InstructionDetails
              callListId={id}
              instruction={instruction}
              isLoading={isLoading}
              onInstructionChanged={handleInstructionChanged}
            />
          ) : (
            selectedContact && (
              <PhoneCallDetails contact={selectedContact} callListId={id} onBack={handleBackToInstruction} />
            )
          )}
        </div>
      </div>
    </div>
  )
}
