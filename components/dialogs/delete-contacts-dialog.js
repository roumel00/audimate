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

export function DeleteContactsDialog({ isOpen, setIsOpen, selectedCount, onConfirmDelete }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError("")

      await onConfirmDelete()
      setIsOpen(false)
    } catch (error) {
      setError(error.message || "Failed to delete contacts")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete {selectedCount} {selectedCount === 1 ? "Contact" : "Contacts"}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedCount === 1 ? "this contact" : "these contacts"}? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
