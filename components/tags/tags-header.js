"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"

export function TagsHeader({ searchQuery, onSearchChange, isCreatingTag, onCreateTagClick }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Tags</h1>
        <p className="text-muted-foreground mt-1">Manage tags to organize your contacts</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {!isCreatingTag && (
          <Button onClick={onCreateTagClick}>
            <Plus className="h-4 w-4 mr-2" />
            Create Tag
          </Button>
        )}
      </div>
    </div>
  )
}
