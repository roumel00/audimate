"use client"

import { Button } from "@/components/ui/button"
import { UploadIcon as FileUpload, Users } from "lucide-react"

export function EmptyContacts({ hasFilters, onClearFilters, onImport }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="rounded-full bg-muted p-3">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No contacts found</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {hasFilters
          ? "No contacts match your current filters. Try clearing your filters to see all contacts."
          : "You don't have any contacts yet. Import contacts to get started."}
      </p>
      <div className="mt-4 flex gap-2">
        {hasFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
        <Button onClick={onImport}>
          <FileUpload className="mr-2 h-4 w-4" />
          Import Contacts
        </Button>
      </div>
    </div>
  )
}
