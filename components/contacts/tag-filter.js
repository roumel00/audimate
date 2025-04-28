"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function TagFilter({ tags, selectedTags, onChange }) {
  const [open, setOpen] = useState(false)

  const handleSelect = (tagId) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId]

    onChange(newSelectedTags)
  }

  const handleClearFilters = (e) => {
    e.stopPropagation()
    onChange([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-dashed hover:translate-y-0 hover:scale-105">
          <Filter className="mr-2 h-4 w-4" />
          {selectedTags.length > 0 ? (
            <>
              Filter by Tags
              <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                {selectedTags.length}
              </Badge>
              <X className="cursor-pointer ml-2 h-4 w-4 hover:text-destructive" onClick={handleClearFilters} />
            </>
          ) : (
            "Filter by Tags"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search tags..." />
          <CommandList>
            <CommandEmpty>No tags found.</CommandEmpty>
            <CommandGroup>
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id)
                return (
                  <CommandItem key={tag.id} onSelect={() => handleSelect(tag.id)} className="bg-secondary flex items-center gap-2 cursor-pointer">
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50",
                      )}
                    >
                    </div>
                    <span>{tag.name}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
