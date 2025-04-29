"use client"

import { Button } from "@/components/ui/button"
import { Users, Plus } from "lucide-react"

export function EmptyContactsState({ onAddContacts }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center flex-1">
      <Users className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No contacts in this list</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Add contacts to this call list to start making AI-powered calls.
      </p>
      <Button onClick={onAddContacts}>
        <Plus className="h-4 w-4 mr-2" />
        Add Contacts
      </Button>
    </div>
  )
}
