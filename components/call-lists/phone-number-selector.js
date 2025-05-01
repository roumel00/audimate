"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PhoneNumberSelector({ selectedPhoneNumber, onPhoneNumberChange }) {
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/twilio/phone-numbers")

        if (!response.ok) {
          throw new Error("Failed to fetch phone numbers")
        }

        const data = await response.json()
        setPhoneNumbers(data.phoneNumbers || [])

        // If we have phone numbers but no selection yet, select the first one
        if (data.phoneNumbers?.length > 0 && !selectedPhoneNumber) {
          onPhoneNumberChange(data.phoneNumbers[0])
        }
      } catch (error) {
        console.error("Error fetching phone numbers:", error)
        toast({
          title: "Error",
          description: "Failed to load phone numbers. Please check your Twilio settings.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPhoneNumbers()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Loading Phone Numbers...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (phoneNumbers.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4" />
            No Phone Numbers
          </CardTitle>
          <CardDescription>Please add a phone number in your settings to make calls.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Calling From
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedPhoneNumber || phoneNumbers[0]} onValueChange={onPhoneNumberChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a phone number" />
          </SelectTrigger>
          <SelectContent>
            {phoneNumbers.map((number) => (
              <SelectItem key={number} value={number} className="cursor-pointer">
                {number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
