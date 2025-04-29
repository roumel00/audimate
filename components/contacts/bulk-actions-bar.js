"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Tag, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

export function BulkActionsBar({ selectedCount, onDelete, onAddTag, tags }) {
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false)

  return (
    <div className="bg-muted/50 border rounded-md p-2 flex items-center justify-between">
      <div className="text-sm font-medium">
        {selectedCount} {selectedCount === 1 ? "contact" : "contacts"} selected
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
        <Popover open={isTagMenuOpen} onOpenChange={setIsTagMenuOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Tag className="h-4 w-4 mr-2" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="end">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandList>
                <CommandEmpty>No tags found.</CommandEmpty>
                <CommandGroup>
                  {tags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => {
                        onAddTag([tag.id])
                        setIsTagMenuOpen(false)
                      }}
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      <span>{tag.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
