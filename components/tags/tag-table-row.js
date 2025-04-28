"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronDown, ChevronUp, Trash2, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function TagTableRow({ tag, onEdit, onDelete, onSelect }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [editData, setEditData] = useState({
    name: tag.name,
    description: tag.description || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const nameInputRef = useRef(null)

  // Determine if description is long enough to truncate
  const isLongDescription = (tag.description || "").length > 60

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStartEditing = () => {
    setEditData({
      name: tag.name,
      description: tag.description || "",
    })
    setIsEditing(true)
  }

  const handleCancelEditing = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!editData.name.trim()) {
      return
    }

    setIsSubmitting(true)
    const success = await onEdit(tag.id, editData)
    setIsSubmitting(false)

    if (success) {
      setIsEditing(false)
    }
  }

  // Render the description with appropriate handling for long text
  const renderDescription = () => {
    if (!tag.description) return <span className="text-muted-foreground">No description</span>

    if (!isLongDescription) return tag.description

    return (
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{tag.description.substring(0, 60)}...</span>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <span className="sr-only">Show full description</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Description for "{tag.name}"</h4>
              <p className="text-sm">{tag.description}</p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  if (isEditing) {
    return (
      <TableRow>
        <TableCell>
          <Input
            ref={nameInputRef}
            name="name"
            value={editData.name}
            onChange={handleChange}
            placeholder="Tag name"
            className="max-w-[200px]"
            required
          />
        </TableCell>
        <TableCell>
          <Textarea
            name="description"
            value={editData.description}
            onChange={handleChange}
            placeholder="Description (optional)"
            className="min-h-[80px] resize-y"
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              title="Save changes"
              disabled={isSubmitting || !editData.name.trim()}
            >
              <Check className="h-4 w-4 text-green-500" />
              <span className="sr-only">Save</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancelEditing}
              title="Cancel editing"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => onSelect && onSelect()}>
      <TableCell>
        <Badge variant="secondary" className="font-medium">
          {tag.name}
        </Badge>
      </TableCell>
      <TableCell className="max-w-md">{renderDescription()}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleStartEditing} title="Edit tag">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-pencil"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(tag)}
            className="hover:text-destructive"
            title="Delete tag"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
