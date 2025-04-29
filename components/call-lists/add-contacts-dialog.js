"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Search, TagIcon, X, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

export function AddContactsDialog({ isOpen, setIsOpen, onAddContacts, existingContactIds = [] }) {
  const [contacts, setContacts] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [selectedContacts, setSelectedContacts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false)

  // Fetch contacts when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchContacts()
      fetchTags()
    } else {
      // Reset state when dialog closes
      setSelectedContacts([])
      setSearchQuery("")
      setSelectedTags([])
    }
  }, [isOpen])

  // Filter contacts based on search query and selected tags
  useEffect(() => {
    if (contacts.length === 0) {
      setFilteredContacts([])
      return
    }

    let filtered = [...contacts]

    // Apply text search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((contact) => {
        const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase()
        return (
          fullName.includes(query) ||
          (contact.email && contact.email.toLowerCase().includes(query)) ||
          (contact.phone && contact.phone.includes(query))
        )
      })
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((contact) => {
        // Check if contact has any of the selected tags
        return contact.tags && contact.tags.some(tag => selectedTags.includes(tag.id))
      })
    }

    setFilteredContacts(filtered)
  }, [searchQuery, contacts, selectedTags])

  const fetchContacts = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch("/api/contacts")

      if (!response.ok) {
        throw new Error("Failed to fetch contacts")
      }

      const data = await response.json()

      // Filter out contacts that are already in the call list
      const availableContacts = data.contacts.filter((contact) => !existingContactIds.includes(contact.id))

      setContacts(availableContacts)
      setFilteredContacts(availableContacts)
    } catch (error) {
      console.error("Error fetching contacts:", error)
      setError("Failed to load contacts. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags")

      if (!response.ok) {
        throw new Error("Failed to fetch tags")
      }

      const data = await response.json()
      setTags(data.tags || [])
    } catch (error) {
      console.error("Error fetching tags:", error)
      // Don't set error state here as it's not critical
    }
  }

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

  const handleAddContacts = async () => {
    if (selectedContacts.length === 0) return

    try {
      setError("")
      await onAddContacts(selectedContacts)
    } catch (err) {
      setError(err.message || "Failed to add contacts")
    }
  }

  const handleTagSelect = (tagId) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId)
      } else {
        return [...prev, tagId]
      }
    })
  }

  const handleClearTags = () => {
    setSelectedTags([])
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Contacts to Call List</DialogTitle>
          <DialogDescription>Select contacts to add to this call list.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start gap-4 mb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 w-full md:w-auto"
                  aria-expanded={isTagPopoverOpen}
                >
                  <TagIcon className="h-4 w-4" />
                  Filter by Tags
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary" className="ml-1 rounded-sm px-1 font-normal">
                      {selectedTags.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search tags..." />
                  <CommandList>
                    <CommandEmpty>No tags found.</CommandEmpty>
                    <CommandGroup>
                      {tags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.id)
                        return (
                          <CommandItem
                            key={tag.id}
                            onSelect={() => handleTagSelect(tag.id)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <div
                              className={cn(
                                "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                isSelected ? "bg-primary text-primary-foreground" : "opacity-50",
                              )}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                            <span>{tag.name}</span>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                  {selectedTags.length > 0 && (
                    <div className="border-t p-2">
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleClearTags}>
                        <X className="h-4 w-4 mr-2" />
                        Clear tags
                      </Button>
                    </div>
                  )}
                </Command>
              </PopoverContent>
            </Popover>

            {selectedContacts.length > 0 && (
              <Badge variant="secondary">
                {selectedContacts.length} selected
              </Badge>
            )}
          </div>
        </div>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="text-sm text-muted-foreground mr-1">Filtered by tags:</span>
            {selectedTags.map(tagId => {
              const tag = tags.find(t => t.id === tagId)
              return tag ? (
                <Badge key={tag.id} variant="outline" className="flex items-center gap-1">
                  {tag.name}
                  <button
                    onClick={() => handleTagSelect(tag.id)}
                    className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tag.name}</span>
                  </button>
                </Badge>
              ) : null
            })}
          </div>
        )}

        <div className="overflow-auto flex-1 border rounded-md">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              {contacts.length === 0 ? (
                <>
                  <p className="text-muted-foreground mb-2">No contacts available to add.</p>
                  <p className="text-sm text-muted-foreground">
                    All your contacts are already in this call list or you need to create contacts first.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-2">No contacts match your search criteria.</p>
                  <div className="flex gap-2 mt-2">
                    {searchQuery && (
                      <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                        Clear Search
                      </Button>
                    )}
                    {selectedTags.length > 0 && (
                      <Button variant="outline" size="sm" onClick={handleClearTags}>
                        Clear Tag Filters
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
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
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => handleSelectContact(contact.id, checked)}
                        aria-label={`Select ${contact.firstName} ${contact.lastName}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {contact.firstName} {contact.lastName}
                    </TableCell>
                    <TableCell>{contact.phone || "—"}</TableCell>
                    <TableCell>{contact.email || "—"}</TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddContacts} disabled={selectedContacts.length === 0}>
            Add {selectedContacts.length} {selectedContacts.length === 1 ? "Contact" : "Contacts"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
