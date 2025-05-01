"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Phone, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import handleRealtimeEvent from "@/lib/handle-realtime-event"
import { getPrompt } from "@/lib/formulate-prompt"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

const BASE_WS_URL = process.env.NEXT_PUBLIC_REALTIME_WS_URL || "ws://localhost:8081"

export default function CallButton({
  phoneNumber,
  contactName,
  contactId,
  instructionId,
  callListId,
  onCallCompleted,
  fromPhoneNumber,
}) {
  const [loading, setLoading] = useState(false)
  const [callStatus, setCallStatus] = useState("disconnected")
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [callStartTime, setCallStartTime] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [usage, setUsage] = useState({ input: 0, output: 0 })
  const [userCredit, setUserCredit] = useState(null)
  const [isCreditLoading, setIsCreditLoading] = useState(true)
  const [creditError, setCreditError] = useState(null)

  const logsWsRef = useRef(null)
  const callSidRef = useRef(null)
  const { toast } = useToast()

  // Fetch user credit information when component mounts
  useEffect(() => {
    const fetchUserCredit = async () => {
      setIsCreditLoading(true)
      setCreditError(null)

      try {
        const response = await fetch("/api/auth/user")
        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const userData = await response.json()
        setUserCredit(userData.user.credit)
      } catch (error) {
        console.error("Error fetching user credit:", error)
        setCreditError("Failed to load credit information")
      } finally {
        setIsCreditLoading(false)
      }
    }

    fetchUserCredit()
  }, [])

  const connectLogsSocket = useCallback(() => {
    if (logsWsRef.current) return

    const socket = new WebSocket(`${BASE_WS_URL.replace(/\/?$/, "/logs")}`)
    logsWsRef.current = socket

    socket.onopen = async () => {
      const promptText = await fetchPrompt()
      socket.send(
        JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: promptText,
          },
        }),
      )
      setCallStatus("connected")
      setCallStartTime(Date.now())
    }

    socket.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data)

        if (data.type === "response.output_item.done" || "response.done") setUsage(data.usage)
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

    // Check if user has sufficient credit
    if (userCredit <= 0) {
      toast({
        title: "Insufficient Credit",
        description: "You don't have enough credit to make a call. Please add credit to continue.",
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
        body: JSON.stringify({
          phoneNumber,
          fromPhoneNumber,
        }),
      })
      const data = await res.json()

      if (!data.success) throw new Error(data.error || "Unknown error")

      callSidRef.current = data.callSid

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
      const callEndTime = Date.now()
      const callLengthRaw = (callEndTime - callStartTime) / 1000
      const callLength = Math.round(callLengthRaw * 10) / 10

      const units = Math.ceil(callLength / 3.6)
      const creditDeduction = units * 0.01

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
          status: "called",
          inputTokens: usage.input,
          outputTokens: usage.output,
          creditDeduction,
        }),
      })

      const data = await response.json()

      if (!data.success) throw new Error(data.error || "Failed to save call transcript")

      toast({
        title: "Call saved",
        description: "The call transcript has been saved successfully",
      })

      // Update user credit after call
      setUserCredit((prev) => prev - creditDeduction)

      // Call the onCallCompleted callback if provided
      if (typeof onCallCompleted === "function") {
        onCallCompleted(contactId, data.phoneCall)
      }
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

    stopRealtimeSession()

    if (callSidRef.current) {
      await fetch(`/api/twilio/realtime-call?callSid=${callSidRef.current}`, {
        method: "DELETE",
      })
      callSidRef.current = null
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

  const fetchPrompt = async () => {
    let promptText = null

    if (instructionId) {
      const instructionRes = await fetch(`/api/instructions/${instructionId}`)
      const instructionData = await instructionRes.json()

      const userRes = await fetch("/api/auth/user")
      const userData = await userRes.json()

      if (instructionData && userData) {
        promptText = getPrompt(userData.user.company, instructionData.instruction, contactName)
      }
    }

    return promptText
  }

  const stopRealtimeSession = () => {
    if (!logsWsRef.current || logsWsRef.current.readyState !== WebSocket.OPEN) return

    logsWsRef.current.send(JSON.stringify({ type: "response.cancel" }))
    logsWsRef.current.send(JSON.stringify({ type: "output_audio_buffer.clear" }))

    logsWsRef.current.close(1000, "Call ended by user")
  }

  // Determine button state based on credit information
  const isButtonDisabled = loading || callStatus === "connected" || isCreditLoading || userCredit <= 0 || !phoneNumber

  // Determine tooltip content based on state
  const getTooltipContent = () => {
    if (isCreditLoading) return "Loading credit information..."
    if (creditError) return creditError
    if (userCredit <= 0) return "Insufficient credit. Please add credit to make calls."
    if (!phoneNumber) return "No phone number available for this contact"
    return null
  }

  const tooltipContent = getTooltipContent()
  const showTooltip = !!tooltipContent

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant="outline"
                size="sm"
                disabled={isButtonDisabled}
                onClick={startCall}
                className={`flex items-center gap-1 ${userCredit <= 0 ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/30" : ""}`}
              >
                {isCreditLoading ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                ) : userCredit <= 0 ? (
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <Phone className="h-3.5 w-3.5" />
                )}
                {loading ? "Calling…" : "Call"}
              </Button>
            </div>
          </TooltipTrigger>
          {showTooltip && (
            <TooltipContent>
              <p>{tooltipContent}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) endCall()
          setOpen(isOpen)
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogContent
          className="sm:max-w-[600px] max-h-[80vh] flex flex-col"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
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
            <Button variant="outline" onClick={endCall} disabled={isSaving || callStatus === "disconnected"}>
              {isSaving ? "Saving..." : callStatus !== "disconnected" ? "End Call" : "Ending Call.."}
            </Button>
            <DialogPrimitive.Close
              className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
              onClick={endCall}
            >
              <XIcon className="cursor-pointer" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
