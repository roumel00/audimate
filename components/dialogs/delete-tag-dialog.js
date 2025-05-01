"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function DeleteTagDialog({ isOpen, setIsOpen, tag, onTagDeleted }) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setError("")
      setIsLoading(true)

      if (!tag || !tag.id) {
        setError("Tag ID is missing")
        return
      }

      const response = await fetch(`/api/tags/${tag.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to delete tag")
      }

      // Close dialog
      setIsOpen(false)

      // Notify parent of deleted tag
      if (onTagDeleted) {
        onTagDeleted(tag.id)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!tag) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Tag
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the tag "{tag.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Tag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
