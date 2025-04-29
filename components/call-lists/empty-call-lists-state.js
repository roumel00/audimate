"use client"

import { Button } from "@/components/ui/button"
import { List, Plus } from "lucide-react"

export function EmptyCallListsState({ onCreateNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-card rounded-xl border shadow-sm">
      <List className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No call lists yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Create your first call list to start organizing contacts for AI-powered calls. Call lists help you group
        contacts for specific campaigns.
      </p>
      <Button onClick={onCreateNew}>
        <Plus className="h-4 w-4 mr-2" />
        Create Call List
      </Button>
    </div>
  )
}
