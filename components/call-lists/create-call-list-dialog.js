"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CreateCallListDialog({ isOpen, setIsOpen, onCallListCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    instructionId: "",
  })
  const [instructions, setInstructions] = useState([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(false)

  // Fetch instructions when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchInstructions()
    }
  }, [isOpen])

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleInstructionChange = (value) => {
    setFormData((prev) => ({ ...prev, instructionId: value }))
  }

  const handleSubmit = async () => {
    try {
      setError("")
      setIsLoading(true)

      if (!formData.name.trim()) {
        setError("Call list name is required")
        return
      }

      const response = await fetch("/api/call-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          instructionId: formData.instructionId || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create call list")
      }

      // Reset form
      setFormData({
        name: "",
        instructionId: "",
      })

      // Close dialog
      setIsOpen(false)

      // Notify parent of new call list
      if (onCallListCreated) {
        onCallListCreated(data.callList)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Call List</DialogTitle>
          <DialogDescription>Create a new call list to organize contacts for AI-powered calls.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Call List Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter call list name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructionId">Instruction Set</Label>
            <Select value={formData.instructionId} onValueChange={handleInstructionChange}>
              <SelectTrigger className="cursor-pointer" id="instructionId" disabled={isLoadingInstructions}>
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
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !formData.name.trim()}>
            {isLoading ? "Creating..." : "Create Call List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
