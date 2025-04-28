"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Tag, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { CreateTagDialog } from "./create-tag-dialog"

export function BulkActionsBar({ selectedCount, onDelete, onAddTag, tags }) {
  const [open, setOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false)

  const handleTagSelect = (tagId) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const handleApplyTags = () => {
    if (selectedTags.length > 0) {
      onAddTag(selectedTags)
      setSelectedTags([])
      setOpen(false)
    }
  }

  const handleTagCreated = (newTag) => {
    setSelectedTags((prev) => [...prev, newTag.id])
  }

  return (
    <div className="bg-muted/50 border rounded-md p-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="rounded-sm px-1 font-normal">
          {selectedCount} selected
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Tag className="h-3.5 w-3.5 mr-2" />
              Add Tags
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0" align="end">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandList>
                <CommandEmpty>
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-sm text-muted-foreground">No tags found</p>
                    <Button variant="link" className="text-xs mt-2 h-auto p-0" onClick={() => setIsCreateTagOpen(true)}>
                      Create a new tag
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id)
                    return (
                      <CommandItem
                        key={tag.id}
                        onSelect={() => handleTagSelect(tag.id)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected ? "bg-primary text-primary-foreground" : "opacity-50",
                          )}
                        >
                          {isSelected && <X className="h-3 w-3 cursor-pointer" />}
                        </div>
                        <span>{tag.name}</span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
              <div className="border-t p-2">
                <Button size="sm" className="w-full h-8" disabled={selectedTags.length === 0} onClick={handleApplyTags}>
                  Apply Tags
                </Button>
              </div>
            </Command>
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="sm" className="h-8 text-destructive hover:bg-destructive/10" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 mr-2" />
          Delete
        </Button>
      </div>

      <CreateTagDialog isOpen={isCreateTagOpen} setIsOpen={setIsCreateTagOpen} onTagCreated={handleTagCreated} />
    </div>
  )
}
