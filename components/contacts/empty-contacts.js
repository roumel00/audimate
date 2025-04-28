"use client"

import { Button } from "@/components/ui/button"
import { FileUp, Filter, Users } from "lucide-react"

export function EmptyContacts({ hasFilters, onClearFilters, onImport }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {hasFilters ? (
        <>
          <Filter className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No matching contacts</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            No contacts match your current filter criteria. Try adjusting your filters or add new contacts.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" onClick={onClearFilters}>
              Clear Filters
            </Button>
            <Button onClick={onImport}>
              <FileUp className="h-4 w-4 mr-2" />
              Import Contacts
            </Button>
          </div>
        </>
      ) : (
        <>
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No contacts yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            You don't have any contacts yet. Import contacts to get started.
          </p>
          <Button onClick={onImport}>
            <FileUp className="h-4 w-4 mr-2" />
            Import Contacts
          </Button>
        </>
      )}
    </div>
  )
}
