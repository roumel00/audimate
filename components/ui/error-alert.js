"use client"

import { AlertCircle } from "lucide-react"

export function ErrorAlert({ message }) {
  if (!message) return null

  return (
    <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2 text-destructive mb-4">
      <AlertCircle className="h-5 w-5 mt-0.5" />
      <span>{message}</span>
    </div>
  )
}
