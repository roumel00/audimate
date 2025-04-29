"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import handleRealtimeEvent from "@/lib/handle-realtime-event"

const BASE_WS_URL = process.env.NEXT_PUBLIC_REALTIME_WS_URL || "ws://localhost:8081"

export default function CallButton({ phoneNumber, contactName, contactId, instructionId, callListId }) {
  const [loading, setLoading] = useState(false)
  const [callStatus, setCallStatus] = useState("disconnected")
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [callStartTime, setCallStartTime] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const logsWsRef = useRef(null)
  const { toast } = useToast()

  const connectLogsSocket = useCallback(() => {
    if (logsWsRef.current) return

    const socket = new WebSocket(`${BASE_WS_URL.replace(/\/?$/, "/logs")}`)
    logsWsRef.current = socket

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "session.update",
          session: { modalities: ["text", "audio"] },
        }),
      )
      setCallStatus("connected")
      setCallStartTime(Date.now())
    }

    socket.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data)
        handleRealtimeEvent(data, setItems)
      } catch (err) {
        console.error("[Logs] bad JSON", err)
      }
    }

    socket.onclose = () => {
      logsWsRef.current = null
      setCallStatus("disconnected")
    }

    socket.onerror = (err) => {
      console.error("[Logs] error", err)
      socket.close()
    }
  }, [])

  const closeLogsSocket = useCallback(() => {
    logsWsRef.current?.close()
    logsWsRef.current = null
  }, [])

  useEffect(() => () => closeLogsSocket(), [closeLogsSocket])

  const startCall = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "No phone number available for this contact",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setCallStatus("starting")
    setItems([])
    setOpen(true)

    try {
      const res = await fetch("/api/twilio/realtime-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      })
      const data = await res.json()

      if (!data.success) throw new Error(data.error || "Unknown error")

      toast({
        title: "Call started",
        description: `Calling ${contactName} at ${phoneNumber}`,
      })

      connectLogsSocket()
    } catch (err) {
      console.error("startCall error", err)
      toast({
        title: "Call failed",
        description: err.message,
        variant: "destructive",
      })
      setCallStatus("disconnected")
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const saveCallTranscript = async () => {
    if (!contactId || items.length === 0 || !callStartTime) return

    setIsSaving(true)

    try {
      // Calculate call duration in seconds
      const callEndTime = Date.now()
      const callLength = Math.round((callEndTime - callStartTime) / 1000)

      // Convert transcript items to plain text
      const transcription = items
        .filter((item) => item.type === "message")
        .map((item) => {
          const speaker = item.role === "user" ? contactName : "Assistant"

          let content = ""
          if (Array.isArray(item.content)) {
            content = item.content
              .map((c) => c?.text || c?.input_text || c?.transcript || (typeof c === "string" ? c : ""))
              .join(" ")
          } else if (typeof item.content === "string") {
            content = item.content
          } else if (item.content?.text) {
            content = item.content.text
          }

          return `${speaker}: ${content}`
        })
        .join("\n\n")

      const response = await fetch("/api/phone-calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          instructionId,
          callListId,
          transcription,
          callLength,
        }),
      })

      const data = await response.json()

      if (!data.success) throw new Error(data.error || "Failed to save call transcript")

      toast({
        title: "Call saved",
        description: "The call transcript has been saved successfully",
      })
    } catch (error) {
      console.error("Error saving call transcript:", error)
      toast({
        title: "Error",
        description: "Failed to save call transcript: " + error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const endCall = async () => {
    if (callStatus === "connected" && items.length > 0) {
      await saveCallTranscript()
    }

    closeLogsSocket()
    setItems([])
    setOpen(false)
    setCallStartTime(null)
  }

  const renderTranscript = () =>
    items.map((item) => {
      if (item.type === "message") {
        const isUser = item.role === "user"

        let textContent = ""
        if (Array.isArray(item.content)) {
          textContent = item.content
            .map((c) => c?.text || c?.input_text || c?.transcript || (typeof c === "string" ? c : ""))
            .join(" ")
        } else if (typeof item.content === "string") {
          textContent = item.content
        } else if (item.content?.text) {
          textContent = item.content.text
        }

        const timestamp = item.created_at
          ? new Date(item.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""

        return (
          <div key={item.id} className={`p-3 mb-2 rounded-md ${isUser ? "bg-accent/30" : "bg-primary/10"}`}>
            <div className="font-semibold flex justify-between">
              <span>{isUser ? contactName : "Assistant"}</span>
              {timestamp && <span className="text-xs text-muted-foreground">{timestamp}</span>}
            </div>
            <div className="mt-1">
              {textContent ? (
                <p>{textContent}</p>
              ) : (
                <div className="flex space-x-1 justify-start py-2">
                  <div
                    className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        )
      }

      return null
    })

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={loading || callStatus === "connected"}
        onClick={startCall}
        className="flex items-center gap-1"
      >
        <Phone className="h-3.5 w-3.5" />
        {loading ? "Calling…" : "Call"}
      </Button>

      <Dialog open={open} onOpenChange={endCall}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Call with {contactName}</DialogTitle>
            <DialogDescription>
              {callStatus === "starting"
                ? "Connecting call…"
                : callStatus === "connected"
                  ? `Connected to ${phoneNumber}`
                  : "Call ended"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-4 bg-background rounded-md border p-4">
            {items.length ? (
              renderTranscript()
            ) : (
              <div className="text-center text-muted-foreground py-10 flex flex-col items-center justify-center">
                {callStatus === "starting" ? (
                  <>
                    <p className="mb-3">Connecting to call…</p>
                    <div className="flex space-x-2">
                      <div
                        className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <p>No transcript yet</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={endCall} disabled={isSaving}>
              {isSaving ? "Saving..." : callStatus === "connected" ? "End Call" : "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
