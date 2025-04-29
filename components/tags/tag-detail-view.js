"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tag, Edit, Save, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function TagDetailView({ tag, onTagUpdated, onTagDeleted }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTag, setEditedTag] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { toast } = useToast()

  // Initialize edited tag when tag changes
  useEffect(() => {
    if (tag) {
      setEditedTag({
        ...tag,
      })
    }
  }, [tag])

  if (!tag) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Tag Details</CardTitle>
          <CardDescription>Select a tag to view details</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>No tag selected</p>
        </CardContent>
      </Card>
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedTag((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      setError("")
      setSuccess("")

      if (!editedTag.name.trim()) {
        setError("Tag name is required")
        return
      }

      const response = await fetch(`/api/tags/${tag.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedTag.name,
          description: editedTag.description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update tag")
      }

      setSuccess("Tag updated successfully")
      setIsEditing(false)

      // Notify parent component that tag was updated
      if (onTagUpdated) {
        onTagUpdated(data.tag)
      }

      // Show success toast
      toast({
        title: "Tag updated",
        description: "The tag has been updated successfully",
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
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch(`/api/tags/${tag.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete tag")
      }

      // Notify parent component that tag was deleted
      if (onTagDeleted) {
        onTagDeleted(tag.id)
      }

      // Show success toast
      toast({
        title: "Tag deleted",
        description: "The tag has been deleted successfully",
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
    }
  }

  const handleCancel = () => {
    setEditedTag({
      ...tag,
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
            <Tag className="h-5 w-5 text-primary" />
            {isEditing ? "Edit Tag" : "Tag Details"}
          </CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <Button variant="destructive" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
        <CardDescription>
          {isEditing ? "Edit tag details and information" : "View complete tag information"}
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
            <div className="space-y-2">
              <Label htmlFor="name">Tag Name</Label>
              <Input id="name" name="name" value={editedTag.name} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={editedTag.description || ""}
                onChange={handleInputChange}
                placeholder="Enter tag description (optional)"
                className="min-h-[120px] resize-y"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Name</h3>
              <Badge variant="secondary" className="text-base font-medium px-3 py-1">
                {tag.name}
              </Badge>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <div className="bg-muted/30 rounded-md p-3 whitespace-pre-wrap min-h-[100px]">
                {tag.description || <span className="text-muted-foreground italic">No description provided</span>}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {isEditing ? (
        <CardFooter className="flex justify-between">
          <Button className="w-full" onClick={handleSave} disabled={isLoading || !editedTag?.name?.trim()}>
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
      ) : (
        <CardFooter>
          <Button variant="destructive" className="w-full" onClick={handleDelete} disabled={isLoading}>
            Delete Tag
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
