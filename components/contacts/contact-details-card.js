"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Phone, Tag, User, Edit, Save, X, Plus, Trash2, AlertCircle, CheckCircle2, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function ContactDetailsCard({ contact, tags = [], onContactUpdated }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContact, setEditedContact] = useState(null)
  const [newField, setNewField] = useState({ field: "", value: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { toast } = useToast()

  // Initialize edited contact when contact changes
  useEffect(() => {
    if (contact) {
      setEditedContact({
        ...contact,
        additionalFields: contact.additionalFields || [],
        tagIds: contact.tags ? contact.tags.map((tag) => tag.id) : [],
      })
    }
  }, [contact])

  if (!contact) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
          <CardDescription>Select a contact to view details</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>No contact selected</p>
        </CardContent>
      </Card>
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedContact((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAdditionalFieldChange = (index, key, value) => {
    const updatedFields = [...editedContact.additionalFields]
    updatedFields[index][key] = value

    setEditedContact((prev) => ({
      ...prev,
      additionalFields: updatedFields,
    }))
  }

  const handleAddField = () => {
    if (!newField.field.trim()) {
      toast({
        title: "Field name required",
        description: "Please enter a name for the custom field",
        variant: "destructive",
      })
      return
    }

    setEditedContact((prev) => ({
      ...prev,
      additionalFields: [...prev.additionalFields, { field: newField.field, value: newField.value }],
    }))

    setNewField({ field: "", value: "" })
  }

  const handleRemoveField = (index) => {
    const updatedFields = [...editedContact.additionalFields]
    updatedFields.splice(index, 1)

    setEditedContact((prev) => ({
      ...prev,
      additionalFields: updatedFields,
    }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      setError("")
      setSuccess("")

      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: editedContact.firstName,
          lastName: editedContact.lastName,
          phone: editedContact.phone,
          email: editedContact.email,
          tagIds: editedContact.tagIds || [],
          additionalFields: editedContact.additionalFields,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update contact")
      }

      setSuccess("Contact updated successfully")
      setIsEditing(false)

      // Notify parent component that contact was updated
      if (onContactUpdated) {
        onContactUpdated(data.contact)
      }

      // Show success toast
      toast({
        title: "Contact updated",
        description: "The contact has been updated successfully",
      })
    } catch (error) {
      setError(error.message)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setSuccess("")
    }
  }

  const handleCancel = () => {
    setEditedContact({
      ...contact,
      additionalFields: contact.additionalFields || [],
    })
    setIsEditing(false)
    setError("")
    setSuccess("")
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {isEditing ? "Edit Contact" : `${contact.firstName} ${contact.lastName}`}
          </CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
        <CardDescription>
          {isEditing ? "Edit contact details and information" : "Contact details and information"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md flex items-start gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={editedContact.firstName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={editedContact.lastName} onChange={handleInputChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" value={editedContact.phone} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={editedContact.email} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <TagSelector
                allTags={tags}
                selectedTagIds={editedContact.tagIds || []}
                onTagsChange={(tagIds) => setEditedContact((prev) => ({ ...prev, tagIds }))}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{contact.phone || "No phone number"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{contact.email || "No email address"}</span>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-1">
            {contact.tags && contact.tags.length > 0 ? (
              contact.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">No tags assigned</span>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Additional Information</h3>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={handleAddField} disabled={!newField.field.trim()}>
                <Plus className="h-3 w-3 mr-1" />
                Add Field
              </Button>
            )}
          </div>

          {isEditing && (
            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="col-span-2">
                <Input
                  placeholder="Field name"
                  value={newField.field}
                  onChange={(e) => setNewField((prev) => ({ ...prev, field: e.target.value }))}
                />
              </div>
              <div className="col-span-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Value"
                    value={newField.value}
                    onChange={(e) => setNewField((prev) => ({ ...prev, value: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {editedContact?.additionalFields && editedContact.additionalFields.length > 0 ? (
            <div className="space-y-3">
              {isEditing ? (
                editedContact.additionalFields.map((field, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2">
                    <div className="col-span-2">
                      <Input
                        value={field.field}
                        onChange={(e) => handleAdditionalFieldChange(index, "field", e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <div className="flex gap-2">
                        <Input
                          value={field.value}
                          onChange={(e) => handleAdditionalFieldChange(index, "value", e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveField(index)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {contact.additionalFields.map((field, index) => (
                    <div key={index} className="col-span-2">
                      <dt className="text-xs text-muted-foreground">{field.field}</dt>
                      <dd className="text-sm">{field.value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">No additional information</span>
          )}
        </div>
      </CardContent>

      {isEditing && (
        <CardFooter>
          <Button className="w-full" onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

function TagSelector({ allTags, selectedTagIds, onTagsChange }) {
  const [open, setOpen] = useState(false)

  const handleSelect = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId))
    } else {
      onTagsChange([...selectedTagIds, tagId])
    }
  }

  const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id))

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 min-h-9">
        {selectedTags.length > 0 ? (
          selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
              {tag.name}
              <button
                onClick={() => handleSelect(tag.id)}
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
              >
                <X className="h-3 w-3 cursor-pointer" />
                <span className="sr-only">Remove {tag.name}</span>
              </button>
            </Badge>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No tags selected</div>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 mt-2">
            <Plus className="h-3.5 w-3.5 mr-2" />
            Add Tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {allTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id)
                  return (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleSelect(tag.id)}
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
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
