"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Edit, Trash2, List, Plus, Check, X } from "lucide-react"
import { DeleteCallListDialog } from "./delete-call-list-dialog"
import { EmptyCallListsState } from "./empty-call-lists-state"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function CallListsTable({ callLists, onDelete, onCreateNew, isLoading }) {
  const router = useRouter()
  const [selectedCallList, setSelectedCallList] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const inputRef = useRef(null)
  const { toast } = useToast()

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingId])

  const handleDeleteClick = (callList, e) => {
    e.stopPropagation()
    setSelectedCallList(callList)
    setIsDeleteDialogOpen(true)
  }

  const handleRowClick = (callList) => {
    // Only navigate if not in edit mode
    if (editingId === null) {
      router.push(`/console/call-lists/${callList.id}`)
    }
  }

  const handleDeleteConfirm = async () => {
    await onDelete(selectedCallList.id)
    setIsDeleteDialogOpen(false)
  }

  const handleEditClick = (callList, e) => {
    e.stopPropagation()
    setEditingId(callList.id)
    setEditingName(callList.name)
  }

  const handleCancelEdit = (e) => {
    e.stopPropagation()
    setEditingId(null)
    setEditingName("")
  }

  const handleSaveEdit = async (callList, e) => {
    e.stopPropagation()

    // Validate name
    if (!editingName.trim()) {
      toast({
        title: "Error",
        description: "Call list name cannot be empty",
        variant: "destructive",
      })
      return
    }

    // Don't update if name hasn't changed
    if (editingName === callList.name) {
      setEditingId(null)
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/call-lists/${callList.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editingName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update call list")
      }

      // Update the call list in the UI
      callList.name = editingName

      toast({
        title: "Success",
        description: "Call list name updated successfully",
      })

      setEditingId(null)
      setEditingName("")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update call list",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleKeyDown = (callList, e) => {
    if (e.key === "Enter") {
      handleSaveEdit(callList, e)
    } else if (e.key === "Escape") {
      handleCancelEdit(e)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            Call Lists
          </CardTitle>
          <CardDescription>Manage your AI calling lists</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (callLists.length === 0) {
    return <EmptyCallListsState onCreateNew={onCreateNew} />
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5 text-primary" />
              Call Lists
            </CardTitle>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </div>
          <CardDescription>Manage your AI calling lists</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Instruction Set</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callLists.map((callList) => (
                  <TableRow
                    key={callList.id}
                    className={`${editingId !== callList.id ? "cursor-pointer hover:bg-muted/50" : ""}`}
                    onClick={() => editingId !== callList.id && handleRowClick(callList)}
                  >
                    <TableCell className="font-medium">
                      {editingId === callList.id ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Input
                            ref={inputRef}
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(callList, e)}
                            className="w-full"
                            disabled={isUpdating}
                          />
                        </div>
                      ) : (
                        callList.name
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{callList.contactCount} contacts</Badge>
                    </TableCell>
                    <TableCell>
                      {callList.instructionName ? (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{callList.instructionName}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No instruction set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {editingId === callList.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleSaveEdit(callList, e)}
                              disabled={isUpdating}
                              title="Save changes"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="sr-only">Save</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                              title="Cancel editing"
                            >
                              <X className="h-4 w-4 text-red-600" />
                              <span className="sr-only">Cancel</span>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleEditClick(callList, e)}
                              title="Edit call list name"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleDeleteClick(callList, e)}
                              className="hover:text-destructive"
                              title="Delete call list"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DeleteCallListDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        callList={selectedCallList}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}
