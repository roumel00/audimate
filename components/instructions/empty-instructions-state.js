"use client"

import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"

export function EmptyInstructionsState({ onCreateNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-card rounded-xl border shadow-sm">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No instruction sets yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Create your first instruction set to start making AI-powered calls. Instruction sets tell the AI how to conduct
        calls with your contacts.
      </p>
      <Button onClick={onCreateNew}>
        <Plus className="h-4 w-4 mr-2" />
        Create Instruction Set
      </Button>
    </div>
  )
}
