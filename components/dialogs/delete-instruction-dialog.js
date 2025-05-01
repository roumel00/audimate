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

export function DeleteInstructionDialog({ isOpen, setIsOpen, instruction, onConfirm }) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setError("")
      setIsLoading(true)
      await onConfirm()
    } catch (err) {
      setError(err.message || "Failed to delete instruction")
    } finally {
      setIsLoading(false)
    }
  }

  if (!instruction) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Instruction
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the instruction &quot;{instruction.name}&quot;? This action cannot be undone.
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
            {isLoading ? "Deleting..." : "Delete Instruction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
