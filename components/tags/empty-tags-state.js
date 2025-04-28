"use client"

import { Button } from "@/components/ui/button"
import { Plus, Tag } from "lucide-react"

export function EmptyTagsState({ searchQuery, isCreatingTag, onCreateTagClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Tag className="h-12 w-12 text-muted-foreground mb-4" />
      {searchQuery ? (
        <>
          <h3 className="text-lg font-medium mb-2">No matching tags</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            No tags match your search query. Try a different search or create a new tag.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium mb-2">No tags yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            You haven't created any tags yet. Tags help you organize your contacts.
          </p>
        </>
      )}
      {!isCreatingTag && (
        <Button onClick={onCreateTagClick}>
          <Plus className="h-4 w-4 mr-2" />
          Create Tag
        </Button>
      )}
    </div>
  )
}
