"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, Trash2, Users, CheckCircle2 } from "lucide-react"
import { AddContactsDialog } from "./add-contacts-dialog"
import { EmptyContactsState } from "./empty-contacts-state"
import CallButton from "@/components/call-button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

export function ContactsManagement({
  callList,
  contacts,
  onAddContacts,
  onRemoveContacts,
  isLoading,
  instruction,
  onContactSelect,
  fromPhoneNumber,
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContacts, setSelectedContacts] = useState([])
  const [isAddContactsDialogOpen, setIsAddContactsDialogOpen] = useState(false)
  const [phoneCalls, setPhoneCalls] = useState([])
  const [calledContactIds, setCalledContactIds] = useState(new Set())

  const refreshPhoneCalls = async () => {
    if (!callList?.id) return

    try {
      const response = await fetch(`/api/phone-calls?callListId=${callList.id}`)
      const data = await response.json()

      if (data.success) {
        setPhoneCalls(data.phoneCalls)

        const toId = (c) => c?._id ?? null
        const calledIds = new Set(data.phoneCalls.map((call) => toId(call.contact)).filter(Boolean))
        setCalledContactIds(calledIds)
      }
    } catch (error) {
      console.error("Error fetching phone calls:", error)
    }
  }

  const handleCallCompleted = (contactId) => {
    // Update calledContactIds immediately
    setCalledContactIds((prev) => new Set([...prev, contactId]))

    // Also refresh the full phone calls data
    refreshPhoneCalls()
  }

  useEffect(() => {
    refreshPhoneCalls()
  }, [callList?.id])

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    return (
      fullName.includes(query) ||
      (contact.email && contact.email.toLowerCase().includes(query)) ||
      (contact.phone && contact.phone.includes(query))
    )
  })

  const handleSelectContact = (contactId, checked) => {
    if (checked) {
      setSelectedContacts((prev) => [...prev, contactId])
    } else {
      setSelectedContacts((prev) => prev.filter((id) => id !== contactId))
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedContacts(filteredContacts.map((contact) => contact.id))
    } else {
      setSelectedContacts([])
    }
  }

  const handleRemoveContacts = async () => {
    if (selectedContacts.length === 0) return

    await onRemoveContacts(selectedContacts)
    setSelectedContacts([])
  }

  const handleAddContacts = async (contactIds) => {
    await onAddContacts(contactIds)
    setIsAddContactsDialogOpen(false)
  }

  const handleRowClick = (contact) => {
    onContactSelect(contact)
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Contacts
          </CardTitle>
          <CardDescription>Manage contacts in this call list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Contacts
            </CardTitle>
            <Button onClick={() => setIsAddContactsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contacts
            </Button>
          </div>
          <CardDescription>Manage contacts in this call list</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 ml-4">
              {selectedContacts.length > 0 ? (
                <>
                  <Badge variant="secondary">{selectedContacts.length} selected</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={handleRemoveContacts}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Remove
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <span>{filteredContacts.length}</span>
                  <span>contacts</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center pb-2 pt-1 px-3 border-b">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={filteredContacts.length > 0 && selectedContacts.length === filteredContacts.length}
                indeterminate={selectedContacts.length > 0 && selectedContacts.length < filteredContacts.length}
                onCheckedChange={handleSelectAll}
                aria-label="Select all contacts"
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All
              </label>
            </div>
          </div>

          {contacts.length === 0 ? (
            <EmptyContactsState onAddContacts={() => setIsAddContactsDialogOpen(true)} />
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No matching contacts</h3>
              <p className="text-muted-foreground mb-4">
                No contacts match your search query. Try a different search term.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="overflow-auto flex-1 border rounded-md">
              <div className="divide-y">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-3 cursor-pointer hover:bg-muted/40 ${
                      calledContactIds.has(contact.id) ? "bg-green-50 dark:bg-green-950/20" : ""
                    }`}
                    onClick={() => handleRowClick(contact)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={(checked) => handleSelectContact(contact.id, checked)}
                          aria-label={`Select ${contact.firstName} ${contact.lastName}`}
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {contact.firstName} {contact.lastName}
                        </div>
                        {calledContactIds.has(contact.id) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-700 dark:text-green-400" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Already called</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>

                      <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                        {contact.phone ? (
                          <CallButton
                            phoneNumber={contact.phone}
                            contactName={`${contact.firstName} ${contact.lastName}`}
                            contactId={contact.id}
                            instructionId={instruction?.id}
                            callListId={callList?.id}
                            onCallCompleted={handleCallCompleted}
                            fromPhoneNumber={fromPhoneNumber}
                          />
                        ) : (
                          <Button variant="outline" size="sm" disabled title="No phone number available">
                            Call
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm pl-8">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{contact.phone || "—"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="truncate">{contact.email || "—"}</span>
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-2 mt-1">
                        <span className="text-muted-foreground whitespace-nowrap">Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {contact.tags && contact.tags.length > 0 ? (
                            contact.tags.map((tag) => (
                              <Badge key={tag.id} variant="secondary" className="text-xs">
                                {tag.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">No tags</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <AddContactsDialog
          isOpen={isAddContactsDialogOpen}
          setIsOpen={setIsAddContactsDialogOpen}
          onAddContacts={handleAddContacts}
          existingContactIds={contacts.map((contact) => contact.id)}
        />
      </Card>
    </TooltipProvider>
  )
}
