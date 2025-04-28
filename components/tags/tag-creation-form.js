"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function TagCreationForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const nameInputRef = useRef(null)

  useEffect(() => {
    // Focus on the name input when the component mounts
    if (nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      return false
    }

    setIsSubmitting(true)
    const success = await onSubmit(formData)
    setIsSubmitting(false)

    if (success) {
      setFormData({ name: "", description: "" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-md p-4 mb-4 bg-muted/30">
      <h3 className="text-lg font-medium mb-4">Create New Tag</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Tag Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            name="name"
            ref={nameInputRef}
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter tag name"
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description (Optional)
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter tag description"
            className="min-h-[80px] resize-y"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
          {isSubmitting ? "Creating..." : "Create Tag"}
        </Button>
      </div>
    </form>
  )
}
