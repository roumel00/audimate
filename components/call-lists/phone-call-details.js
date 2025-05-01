"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Clock, FileText, Phone, PhoneOff, RefreshCw, User, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export function PhoneCallDetails({ contact, callListId, onBack }) {
  const [phoneCall, setPhoneCall] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const { toast } = useToast()

  const refreshPhoneCall = async () => {
    if (!contact?.id) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/phone-calls?contactId=${contact.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch phone call data")
      }

      const data = await response.json()

      if (data.success) {
        // Filter phone calls for the current call list
        const callsForThisList = data.phoneCalls.filter(
          (call) => call.callList && call.callList.toString() === callListId,
        )

        setPhoneCall(callsForThisList.length > 0 ? callsForThisList[0] : null)
      } else {
        throw new Error(data.error || "Unknown error")
      }
    } catch (error) {
      console.error("Error fetching phone call:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const generateSummary = async () => {
    if (!phoneCall?.transcription) {
      toast({
        title: "No transcript available",
        description: "A transcript is required to generate a summary.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSummarizing(true)

      const response = await fetch(`/api/call-lists/${callListId}/summarise-transcript`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcription: phoneCall.transcription }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate summary")
      }

      const data = await response.json()

      if (data.result) {
        // Update the phone call with the new summary
        const updatedPhoneCall = { ...phoneCall, summary: data.result }
        setPhoneCall(updatedPhoneCall)

        // Save the summary to the database
        await fetch(`/api/phone-calls/${phoneCall._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ summary: data.result }),
        })

        toast({
          title: "Summary generated",
          description: "The call summary has been generated successfully.",
        })
      } else {
        throw new Error("No summary was generated")
      }
    } catch (error) {
      console.error("Error generating summary:", error)
      toast({
        title: "Failed to generate summary",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSummarizing(false)
    }
  }

  useEffect(() => {
    refreshPhoneCall()
  }, [contact, callListId])

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48 bg-muted" />
            <Skeleton className="h-10 w-24 bg-muted" />
          </div>
          <Skeleton className="h-4 w-full max-w-[250px] mt-2 bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-3/4 bg-muted" />
            <Skeleton className="h-24 w-full mt-4 bg-muted" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {contact.firstName} {contact.lastName}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Instructions
          </Button>
        </div>
        <CardDescription>
          {contact.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {contact.phone}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
            <p className="font-medium">Error loading call data</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!error && !phoneCall && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <PhoneOff className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Call Records</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              This contact hasn&apos;t been called yet with this call list.
            </p>
          </div>
        )}

        {!error && phoneCall && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {phoneCall.callLength
                    ? `${Math.floor(phoneCall.callLength / 60)}:${String(phoneCall.callLength % 60).padStart(2, "0")}`
                    : "Duration unknown"}
                </Badge>

                {phoneCall.createdAt && (
                  <Badge variant="secondary">
                    {formatDistanceToNow(new Date(phoneCall.createdAt), { addSuffix: true })}
                  </Badge>
                )}
              </div>
            </div>

            <div className="border rounded-md p-4 bg-background">
              <h3 className="text-sm font-medium mb-2">Call Transcript</h3>
              {phoneCall.transcription ? (
                <div className="whitespace-pre-wrap text-sm">{phoneCall.transcription}</div>
              ) : (
                <p className="text-muted-foreground text-sm">No transcript available</p>
              )}
            </div>

            {phoneCall.summary ? (
              <div className="border rounded-md p-4 bg-background">
                <h3 className="text-sm font-medium mb-2">Call Summary</h3>
                <div className="whitespace-pre-wrap text-sm">{phoneCall.summary}</div>
              </div>
            ) : phoneCall.transcription ? (
              <div className="flex justify-center mt-4">
                <Button onClick={generateSummary} disabled={isSummarizing} className="flex items-center gap-2">
                  {isSummarizing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Call Summary
                    </>
                  )}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
