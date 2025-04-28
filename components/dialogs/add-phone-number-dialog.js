"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function AddPhoneNumberDialog({ onAddPhoneNumber, isOpen, setIsOpen }) {
  const [newPhoneNumber, setNewPhoneNumber] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddPhoneNumber = async () => {
    setError("")

    // Basic validation
    if (!newPhoneNumber) {
      setError("Phone number is required")
      return
    }

    // Format validation (simple check)
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(newPhoneNumber)) {
      setError("Phone number must be in E.164 format (e.g., +12345678901)")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/twilio/phone-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: newPhoneNumber }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to add phone number")
      }

      setNewPhoneNumber("")
      onAddPhoneNumber()
      setIsOpen(false)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Phone Number
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Phone Number</DialogTitle>
          <DialogDescription>Add a Twilio phone number in E.164 format (e.g., +12345678901)</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number (E.164 format)</Label>
          <Input
            id="phoneNumber"
            value={newPhoneNumber}
            onChange={(e) => setNewPhoneNumber(e.target.value)}
            placeholder="+12345678901"
          />
          <p className="text-xs text-muted-foreground">Must include country code with + prefix</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAddPhoneNumber} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Phone Number"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
