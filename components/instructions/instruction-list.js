"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Edit, Trash2, ShoppingBag } from "lucide-react"
import { DeleteInstructionDialog } from "./delete-instruction-dialog"
import { EmptyInstructionsState } from "./empty-instructions-state"

export function InstructionList({ instructions, onEdit, onDelete, onCreateNew, isLoading }) {
  const [selectedInstruction, setSelectedInstruction] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDeleteClick = (instruction, e) => {
    e.stopPropagation()
    setSelectedInstruction(instruction)
    setIsDeleteDialogOpen(true)
  }

  const handleEditClick = (instruction, e) => {
    e.stopPropagation()
    onEdit(instruction)
  }

  const handleDeleteConfirm = async () => {
    await onDelete(selectedInstruction.id)
    setIsDeleteDialogOpen(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Instruction Sets
          </CardTitle>
          <CardDescription>Manage your AI calling instructions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (instructions.length === 0) {
    return <EmptyInstructionsState onCreateNew={onCreateNew} />
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Instruction Sets
            </CardTitle>
            <Button onClick={onCreateNew}>Create New</Button>
          </div>
          <CardDescription>Manage your AI calling instructions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Offering</TableHead>
                  <TableHead>Objections</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instructions.map((instruction) => (
                  <TableRow key={instruction.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{instruction.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">
                          {instruction.offering || "No offering specified"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{instruction.objections?.length || 0} objections</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleEditClick(instruction, e)}
                          title="Edit instruction"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteClick(instruction, e)}
                          className="hover:text-destructive"
                          title="Delete instruction"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DeleteInstructionDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        instruction={selectedInstruction}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}
