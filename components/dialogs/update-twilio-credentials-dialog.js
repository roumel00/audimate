"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function UpdateTwilioCredentialsDialog({ isOpen, setIsOpen, onCredentialsUpdated, isUpdate = false }) {
  const [formData, setFormData] = useState({
    accountSid: "",
    authToken: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Prevent dialog from closing when page loses focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Don't close dialog when page becomes hidden/visible
    }

    const handleFocusChange = () => {
      // Don't close dialog when window loses/gains focus
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocusChange)
    window.addEventListener('blur', handleFocusChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocusChange)
      window.removeEventListener('blur', handleFocusChange)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/twilio/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to save Twilio credentials")
      }

      setSuccess(true)

      // Clear form after successful submission
      setFormData({
        accountSid: "",
        authToken: "",
      })

      // Close dialog after a short delay
      setTimeout(() => {
        setIsOpen(false)

        // Notify parent component that credentials were updated
        if (onCredentialsUpdated) {
          onCredentialsUpdated()
        }
      }, 1500)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <DialogTrigger asChild>
        <Button variant={isUpdate ? "outline" : "default"}>
          {isUpdate ? "Update Twilio Credentials" : "Set Up Twilio Credentials"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isUpdate ? "Update Twilio Credentials" : "Set Up Twilio Credentials"}</DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Enter your new Twilio credentials. For security reasons, you must enter both values even if you're only changing one."
              : "Enter your Twilio credentials to enable calling features"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md flex items-start gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5 mt-0.5" />
            <span>
              {isUpdate ? "Twilio credentials updated successfully!" : "Twilio credentials saved successfully!"}
            </span>
          </div>
        )}

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountSid">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                <span>{isUpdate ? "New Twilio Account SID" : "Twilio Account SID"}</span>
              </div>
            </Label>
            <Input
              id="accountSid"
              name="accountSid"
              value={formData.accountSid}
              onChange={handleChange}
              placeholder="AC..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="authToken">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                <span>{isUpdate ? "New Twilio Auth Token" : "Twilio Auth Token"}</span>
              </div>
            </Label>
            <Input
              id="authToken"
              name="authToken"
              type="password"
              value={formData.authToken}
              onChange={handleChange}
              required
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? isUpdate
                ? "Updating..."
                : "Saving..."
              : isUpdate
                ? "Update Credentials"
                : "Save Credentials"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
