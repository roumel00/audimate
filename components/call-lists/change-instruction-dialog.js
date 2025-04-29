"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function ChangeInstructionDialog({ isOpen, setIsOpen, callListId, currentInstructionId, onInstructionChanged }) {
  const [instructions, setInstructions] = useState([])
  const [selectedInstructionId, setSelectedInstructionId] = useState(currentInstructionId || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Fetch instructions when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchInstructions()
      // Reset selected instruction to current one when dialog opens
      setSelectedInstructionId(currentInstructionId || "")
    }
  }, [isOpen, currentInstructionId])

  const fetchInstructions = async () => {
    try {
      setIsLoadingInstructions(true)
      const response = await fetch("/api/instructions")

      if (!response.ok) {
        throw new Error("Failed to fetch instructions")
      }

      const data = await response.json()
      setInstructions(data.instructions || [])
    } catch (error) {
      console.error("Error fetching instructions:", error)
      setError("Failed to load instructions. Please try again.")
    } finally {
      setIsLoadingInstructions(false)
    }
  }

  const handleInstructionChange = (value) => {
    setSelectedInstructionId(value === "none" ? "" : value)
  }

  const handleSubmit = async () => {
    try {
      setError("")
      setIsLoading(true)

      const response = await fetch(`/api/call-lists/${callListId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instructionId: selectedInstructionId || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update instruction")
      }

      // Close dialog
      setIsOpen(false)

      // Notify parent of instruction change
      if (onInstructionChanged) {
        onInstructionChanged(selectedInstructionId || null)
      }

      toast({
        title: "Instruction updated",
        description: selectedInstructionId 
          ? "The instruction set has been updated for this call list." 
          : "The instruction set has been removed from this call list.",
      })
    } catch (err) {
      setError(err.message)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Instruction Set</DialogTitle>
          <DialogDescription>
            Select a different instruction set for this call list or remove the current one.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-medium">Instruction Set</span>
            </div>
            
            <Select value={selectedInstructionId || "none"} onValueChange={handleInstructionChange}>
              <SelectTrigger className="cursor-pointer" disabled={isLoadingInstructions}>
                <SelectValue placeholder="Select an instruction set" />
              </SelectTrigger>
              <SelectContent>
                {instructions.map((instruction) => (
                  <SelectItem className="cursor-pointer transition-all duration-300" key={instruction.id} value={instruction.id}>
                    {instruction.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {isLoadingInstructions && <p className="text-sm text-muted-foreground">Loading instructions...</p>}
            
            <p className="text-sm text-muted-foreground mt-2">
              {selectedInstructionId === "" 
                ? "This call list will have no instruction set." 
                : "The selected instruction set will be used for all calls in this list."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Instruction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
