"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle, Phone, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AddPhoneNumberDialog } from "@/components/dialogs/add-phone-number-dialog"

export function TwilioPhoneNumbersCard() {
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Fetch phone numbers
  const fetchPhoneNumbers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/twilio/phone-numbers")

      if (!response.ok) {
        throw new Error("Failed to fetch phone numbers")
      }

      const data = await response.json()
      setPhoneNumbers(data.phoneNumbers || [])
    } catch (error) {
      console.error("Error fetching phone numbers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPhoneNumbers()
  }, [])

  // Remove phone number
  const handleRemovePhoneNumber = async (phoneNumber) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/twilio/phone-numbers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to remove phone number")
      }

      // Refresh phone numbers
      fetchPhoneNumbers()
    } catch (error) {
      console.error("Error removing phone number:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          <CardTitle>Twilio Phone Numbers</CardTitle>
        </div>
        <CardDescription>Manage the phone numbers used for outbound calls</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <>
              {phoneNumbers.length === 0 ? (
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                  <span>No phone numbers added yet</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Your Phone Numbers</Label>
                  <div className="flex flex-wrap gap-2">
                    {phoneNumbers.map((number, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Badge variant="secondary" className="flex items-center gap-2 py-1.5 pl-3 text-base">
                          <Phone className="h-7 w-7" />
                          {number}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:translate-y-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleRemovePhoneNumber(number)}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <AddPhoneNumberDialog
                isOpen={isAddDialogOpen}
                setIsOpen={setIsAddDialogOpen}
                onAddPhoneNumber={fetchPhoneNumbers}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
