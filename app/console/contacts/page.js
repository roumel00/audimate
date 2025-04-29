"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/pagination"
import { ContactsTable } from "@/components/contacts/contacts-table"
import { TagFilter } from "@/components/contacts/tag-filter"
import { ImportContactsDialog } from "@/components/contacts/import-contacts-dialog"
import { ContactDetailsCard } from "@/components/contacts/contact-details-card"
import { BulkActionsBar } from "@/components/contacts/bulk-actions-bar"
import { DeleteContactsDialog } from "@/components/dialogs/delete-contacts-dialog"
import { AddContactDialog } from "@/components/contacts/add-contact-dialog"
import { UploadIcon as FileUpload, Users, Filter, Search, X, UserPlus } from "lucide-react"
import { EmptyContacts } from "@/components/contacts/empty-contacts"

export default function ContactsPage() {
  const { data: session } = useSession()
  const [contacts, setContacts] = useState([])
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch contacts with pagination and filtering
  const fetchContacts = async (page = 1, tagIds = []) => {
    try {
      setIsLoading(true)

      const tagsParam = tagIds.length > 0 ? `&tags=${tagIds.join(",")}` : ""
      const response = await fetch(`/api/contacts?page=${page}&limit=${pagination.limit}${tagsParam}`)

      if (!response.ok) {
        throw new Error("Failed to fetch contacts")
      }

      const data = await response.json()
      setContacts(data.contacts)
      setPagination(data.pagination)

      // Clear selected contacts when fetching new contacts
      setSelectedContacts([])
      setSelectedContact(null)
    } catch (error) {
      console.error("Error fetching contacts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch all tags
  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags")

      if (!response.ok) {
        throw new Error("Failed to fetch tags")
      }

      const data = await response.json()
      setTags(data.tags)
    } catch (error) {
      console.error("Error fetching tags:", error)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (session) {
      fetchTags()
      fetchContacts(pagination.page, selectedTags)
    }
  }, [session])

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchContacts(newPage, selectedTags)
  }

  // Handle tag filter change
  const handleTagFilterChange = (tagIds) => {
    setSelectedTags(tagIds)
    fetchContacts(1, tagIds) // Reset to first page when filter changes
  }

  // Handle successful import
  const handleImportSuccess = () => {
    fetchContacts(pagination.page, selectedTags)
  }

  // Handle contact added
  const handleContactAdded = () => {
    fetchContacts(pagination.page, selectedTags)
  }

  // Handle contact selection
  const handleSelectContact = (contactId, checked) => {
    if (checked) {
      setSelectedContacts((prev) => [...prev, contactId])
    } else {
      setSelectedContacts((prev) => prev.filter((id) => id !== contactId))
    }
  }

  // Handle select all contacts
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedContacts(filteredContacts.map((contact) => contact.id))
    } else {
      setSelectedContacts([])
    }
  }

  // Handle row click to show contact details
  const handleRowClick = (contact) => {
    setSelectedContact(contact)
  }

  // Handle contact update
  const handleContactUpdated = (updatedContact) => {
    // Get the tags for the updated contact
    const contactTags =
      updatedContact.tagIds
        ?.map((tagId) => {
          const tag = tags.find((t) => t.id === tagId)
          return tag ? { id: tag.id, name: tag.name, description: tag.description } : null
        })
        .filter(Boolean) || []

    // Update the contact in the contacts list
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.id === updatedContact.id ? { ...updatedContact, tags: contactTags } : contact,
      ),
    )

    // Update the selected contact
    setSelectedContact((prev) => {
      if (prev && prev.id === updatedContact.id) {
        return { ...updatedContact, tags: contactTags }
      }
      return prev
    })
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const response = await fetch("/api/contacts/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: selectedContacts }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to delete contacts")
      }

      // Refresh contacts after deletion
      fetchContacts(pagination.page, selectedTags)
    } catch (error) {
      console.error("Error deleting contacts:", error)
      throw error
    }
  }

  // Handle bulk add tag
  const handleBulkAddTag = async (tagIds) => {
    try {
      const response = await fetch("/api/contacts/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactIds: selectedContacts,
          tagIds: tagIds,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to update contacts")
      }

      // Refresh contacts after update
      fetchContacts(pagination.page, selectedTags)
    } catch (error) {
      console.error("Error updating contacts:", error)
    }
  }

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase().trim()
    return (
      (contact.firstName && contact.firstName.toLowerCase().includes(query)) ||
      (contact.lastName && contact.lastName.toLowerCase().includes(query)) ||
      (contact.email && contact.email.toLowerCase().includes(query)) ||
      (contact.phone && contact.phone.toLowerCase().includes(query)) ||
      (contact.tags && contact.tags.some((tag) => tag.name.toLowerCase().includes(query)))
    )
  })

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground mt-1">Manage your contact list</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <TagFilter tags={tags} selectedTags={selectedTags} onChange={handleTagFilterChange} />

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsAddContactDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
            <Button onClick={() => setIsImportDialogOpen(true)}>
              <FileUpload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </div>

      {selectedContacts.length > 0 && (
        <div className="mb-4">
          <BulkActionsBar
            selectedCount={selectedContacts.length}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onAddTag={handleBulkAddTag}
            tags={tags}
          />
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts by name, email, phone or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Contact List</CardTitle>
                </div>

                {selectedTags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Filtered by:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedTags.map((tagId) => {
                        const tag = tags.find((t) => t.id === tagId)
                        return tag ? (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
              <CardDescription>
                {pagination.total > 0
                  ? searchQuery
                    ? `Found ${filteredContacts.length} contacts matching "${searchQuery}" out of ${pagination.total} total contacts`
                    : `Showing ${Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} contacts`
                  : "No contacts found"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : contacts.length > 0 ? (
                <>
                  <ContactsTable
                    contacts={searchQuery ? filteredContacts : contacts}
                    tags={tags}
                    selectedContacts={selectedContacts}
                    onSelectContact={handleSelectContact}
                    onSelectAll={handleSelectAll}
                    onRowClick={handleRowClick}
                  />

                  {pagination.totalPages > 1 && !searchQuery && (
                    <div className="mt-4 flex justify-center">
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <EmptyContacts
                  hasFilters={selectedTags.length > 0 || searchQuery.length > 0}
                  onClearFilters={() => {
                    handleTagFilterChange([])
                    setSearchQuery("")
                  }}
                  onImport={() => setIsImportDialogOpen(true)}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <ContactDetailsCard contact={selectedContact} tags={tags} onContactUpdated={handleContactUpdated} />
        </div>
      </div>

      <ImportContactsDialog
        isOpen={isImportDialogOpen}
        setIsOpen={setIsImportDialogOpen}
        tags={tags}
        onImportSuccess={handleImportSuccess}
        onTagsUpdated={fetchTags}
      />

      <AddContactDialog
        isOpen={isAddContactDialogOpen}
        setIsOpen={setIsAddContactDialogOpen}
        tags={tags}
        onContactAdded={handleContactAdded}
      />

      <DeleteContactsDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        selectedCount={selectedContacts.length}
        onConfirmDelete={handleBulkDelete}
      />
    </div>
  )
}
