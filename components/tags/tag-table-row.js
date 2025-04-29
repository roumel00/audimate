"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function TagTableRow({ tag, onEdit, onDelete, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Determine if description is long enough to truncate
  const isLongDescription = (tag.description || "").length > 60

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
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(tag)
            }}
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
