"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TagsHeader } from "@/components/tags/tags-header"
import { TagCreationForm } from "@/components/tags/tag-creation-form"
import { TagsTable } from "@/components/tags/tags-table"
import { DeleteTagDialog } from "@/components/tags/delete-tag-dialog"
import { ErrorAlert } from "@/components/ui/error-alert"
import { TagDetailView } from "@/components/tags/tag-detail-view"

export default function TagsPage() {
  const { data: session } = useSession()
  const [tags, setTags] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState(null)
  const [isCreatingTag, setIsCreatingTag] = useState(false)
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Fetch all tags
  const fetchTags = async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await fetch("/api/tags")

      if (!response.ok) {
        throw new Error("Failed to fetch tags")
      }

      const data = await response.json()
      setTags(data.tags)
    } catch (error) {
      console.error("Error fetching tags:", error)
      setError("Failed to load tags. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load tags. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (session) {
      fetchTags()
    }
  }, [session])

  // Handle creating a new tag
  const handleCreateTag = async (tagData) => {
    try {
      setError("")

      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tagData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create tag")
      }

      // Add new tag to the list
      setTags((prevTags) => [...prevTags, data.tag])

      // Exit creation mode
      setIsCreatingTag(false)

      toast({
        title: "Tag created",
        description: `Tag "${data.tag.name}" has been created successfully.`,
      })

      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  // Handle updating a tag
  const handleUpdateTag = async (tagId, tagData) => {
    try {
      setError("")

      const response = await fetch(`/api/tags/${tagId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tagData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update tag")
      }

      // Update tag in the list
      setTags((prevTags) => prevTags.map((tag) => (tag.id === tagId ? data.tag : tag)))

      // If the selected tag was updated, update it as well
      if (selectedTag && selectedTag.id === tagId) {
        setSelectedTag(data.tag)
      }

      toast({
        title: "Tag updated",
        description: `Tag "${data.tag.name}" has been updated successfully.`,
      })

      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  // Handle tag delete
  const handleDeleteTag = (tag) => {
    setSelectedTag(tag)
    setIsDeleteDialogOpen(true)
  }

  // Handle tag deletion confirmation
  const handleTagDeleted = (tagId) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== tagId))

    // If the deleted tag was selected, clear the selection
    if (selectedTag && selectedTag.id === tagId) {
      setSelectedTag(null)
    }

    toast({
      title: "Tag deleted",
      description: "The tag has been deleted successfully.",
    })
  }

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle tag selection for detail view
  const handleTagSelect = (tag) => {
    setSelectedTag(tag)
  }

  // Filter and sort tags based on search query and sort settings
  const filteredAndSortedTags = tags
    .filter(
      (tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tag.description && tag.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .sort((a, b) => {
      const fieldA = a[sortField] || ""
      const fieldB = b[sortField] || ""

      if (sortDirection === "asc") {
        return fieldA.localeCompare(fieldB)
      } else {
        return fieldB.localeCompare(fieldA)
      }
    })

  return (
    <div className="container mx-auto p-6">
      <TagsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isCreatingTag={isCreatingTag}
        onCreateTagClick={() => setIsCreatingTag(true)}
      />

      {error && <ErrorAlert message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <CardTitle>Tag Management</CardTitle>
              </div>
              <CardDescription>Create, edit, and delete tags to organize your contacts</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* New Tag Form */}
                  {isCreatingTag && (
                    <TagCreationForm onSubmit={handleCreateTag} onCancel={() => setIsCreatingTag(false)} />
                  )}

                  {/* Tags Table */}
                  <TagsTable
                    tags={filteredAndSortedTags}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onEdit={handleUpdateTag}
                    onDelete={handleDeleteTag}
                    searchQuery={searchQuery}
                    isCreatingTag={isCreatingTag}
                    onCreateTagClick={() => setIsCreatingTag(true)}
                    onTagSelect={handleTagSelect}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <TagDetailView tag={selectedTag} />
        </div>
      </div>

      <DeleteTagDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        tag={selectedTag}
        onTagDeleted={handleTagDeleted}
      />
    </div>
  )
}
