"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, Trash2, Users } from "lucide-react"
import { AddContactsDialog } from "./add-contacts-dialog"
import { EmptyContactsState } from "./empty-contacts-state"
import CallButton from "@/components/call-button"

export function ContactsManagement({
  callList,
  contacts,
  onAddContacts,
  onRemoveContacts,
  isLoading,
  instruction,
  onContactSelect,
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContacts, setSelectedContacts] = useState([])
  const [isAddContactsDialogOpen, setIsAddContactsDialogOpen] = useState(false)

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

          {selectedContacts.length > 0 && (
            <div className="flex items-center gap-2 ml-4">
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
            </div>
          )}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={filteredContacts.length > 0 && selectedContacts.length === filteredContacts.length}
                      indeterminate={selectedContacts.length > 0 && selectedContacts.length < filteredContacts.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all contacts"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Tags</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => handleRowClick(contact)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => handleSelectContact(contact.id, checked)}
                        aria-label={`Select ${contact.firstName} ${contact.lastName}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="truncate max-w-[150px] md:max-w-none">
                        {contact.firstName} {contact.lastName}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="truncate max-w-[120px]">{contact.phone || "—"}</div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="truncate max-w-[150px]">{contact.email || "—"}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {contact.tags && contact.tags.length > 0 ? (
                          contact.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs">No tags</span>
                        )}
                        {contact.tags && contact.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{contact.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {contact.phone ? (
                        <CallButton
                          phoneNumber={contact.phone}
                          contactName={`${contact.firstName} ${contact.lastName}`}
                          contactId={contact.id}
                          instructionId={instruction?.id}
                          callListId={callList?.id}
                        />
                      ) : (
                        <Button variant="outline" size="sm" disabled title="No phone number available">
                          Call
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
  )
}
