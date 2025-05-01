"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, MessageSquare, ShoppingBag, Edit } from 'lucide-react'
import { useState } from "react"
import { ChangeInstructionDialog } from "../dialogs/change-instruction-dialog"

export function InstructionDetails({ callListId, instruction, isLoading, onInstructionChanged }) {
  const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false)

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Instruction Details
          </CardTitle>
          <CardDescription>View the instruction set for this call list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleOpenChangeDialog = () => {
    setIsChangeDialogOpen(true)
  }

  if (!instruction) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Instruction Details
            </CardTitle>
            <CardDescription>No instruction set assigned to this call list</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleOpenChangeDialog}>
            <FileText className="h-4 w-4 mr-2" />
            Add Instruction
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No instruction set</h3>
            <p className="text-muted-foreground max-w-md">
              This call list doesn't have an instruction set assigned. Instruction sets tell the AI how to conduct
              calls.
            </p>
            <Button variant="outline" className="mt-4" onClick={handleOpenChangeDialog}>
              Add an Instruction Set
            </Button>
          </div>
          
          <ChangeInstructionDialog
            isOpen={isChangeDialogOpen}
            setIsOpen={setIsChangeDialogOpen}
            callListId={callListId}
            currentInstructionId={null}
            onInstructionChanged={onInstructionChanged}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Instruction Details
          </CardTitle>
          <CardDescription>View the instruction set for this call list</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleOpenChangeDialog}>
          Change Script
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">{instruction.name}</h3>
            <Badge variant="secondary">Instruction Set</Badge>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <ShoppingBag className="h-4 w-4" />
              Offering
            </h4>
            <div className="bg-muted/30 rounded-md p-3 whitespace-pre-wrap">
              {instruction.offering || <span className="text-muted-foreground italic">No offering specified</span>}
            </div>
          </div>

          {instruction.currentScript && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Script</h4>
              <div className="bg-muted/30 rounded-md p-3 whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                {instruction.currentScript}
              </div>
            </div>
          )}

          {instruction.objections && instruction.objections.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Objections and Answers ({instruction.objections.length})
              </h4>

              <div className="space-y-4">
                {instruction.objections.map((obj, index) => (
                  <div key={index} className="border rounded-md overflow-hidden">
                    <div className="bg-muted p-3 font-medium">Objection: {obj.objection}</div>
                    <div className="p-3 whitespace-pre-wrap">{obj.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <ChangeInstructionDialog
          isOpen={isChangeDialogOpen}
          setIsOpen={setIsChangeDialogOpen}
          callListId={callListId}
          currentInstructionId={instruction.id}
          onInstructionChanged={onInstructionChanged}
        />
      </CardContent>
    </Card>
  )
}
