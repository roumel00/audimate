"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts, dismissToast } = useToast()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return createPortal(
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-md w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>,
    document.body,
  )
}

function Toast({ toast, onDismiss }) {
  const { id, title, description, variant } = toast

  return (
    <div
      className={cn(
        "bg-background border shadow-lg rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-right-full",
        variant === "destructive" && "border-destructive text-destructive",
      )}
    >
      <div className="flex-1">
        {title && <div className="font-semibold">{title}</div>}
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </div>
      <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}
