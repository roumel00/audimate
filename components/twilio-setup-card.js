"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, KeyRound, Phone } from "lucide-react"

export function TwilioSetupCard({ onSetupComplete }) {
  const [formData, setFormData] = useState({
    accountSid: "",
    authToken: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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

      // Notify parent component that setup is complete
      if (onSetupComplete) {
        onSetupComplete()
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          <CardTitle>Twilio Setup Required</CardTitle>
        </div>
        <CardDescription>
          To make calls with Audimate, you need to connect your Twilio account. Your credentials will be securely
          stored.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2 text-destructive mb-4">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 p-3 rounded-md flex items-start gap-2 text-green-700 mb-4">
            <CheckCircle2 className="h-5 w-5 mt-0.5" />
            <span>Twilio credentials saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountSid">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                <span>Twilio Account SID</span>
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
                <span>Twilio Auth Token</span>
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
      </CardContent>
      <CardFooter>
        <div className="flex flex-col w-full gap-2">
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Save Credentials"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Your credentials are securely hashed and never stored in plain text
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
