"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, FileUp, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateTagDialog } from "./create-tag-dialog"
import { parseCSV } from "@/lib/csv-parser"

export function ImportContactsDialog({ isOpen, setIsOpen, tags, onImportSuccess, onTagsUpdated }) {
  const [step, setStep] = useState("upload") // upload, preview, importing
  const [csvFile, setCsvFile] = useState(null)
  const [parsedContacts, setParsedContacts] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false)
  const [error, setError] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  const handleFileChange = async (e) => {
    setError("")
    const file = e.target.files[0]
    await processFile(file)
  }

  const processFile = async (file) => {
    if (!file) return

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please upload a CSV file")
      return
    }

    setCsvFile(file)

    try {
      const contacts = await parseCSV(file)

      if (contacts.length === 0) {
        setError("No contacts found in the CSV file")
        return
      }

      setParsedContacts(contacts)
      setStep("preview")
    } catch (err) {
      console.error("Error parsing CSV:", err)
      setError("Failed to parse CSV file. Please check the format.")
    }
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Only set isDragging to false if we're leaving the dropzone (not entering a child element)
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setError("")

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await processFile(files[0])
    }
  }

  const handleTagToggle = (tagId) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const handleImport = async () => {
    try {
      setIsImporting(true)

      const response = await fetch("/api/contacts/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contacts: parsedContacts,
          tagIds: selectedTags,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to import contacts")
      }

      const data = await response.json()

      // Reset state
      setCsvFile(null)
      setParsedContacts([])
      setSelectedTags([])
      setStep("upload")

      // Close dialog
      setIsOpen(false)

      // Notify parent of success
      if (onImportSuccess) {
        onImportSuccess(data.count)
      }
    } catch (err) {
      console.error("Error importing contacts:", err)
      setError(err.message || "Failed to import contacts")
    } finally {
      setIsImporting(false)
    }
  }

  const handleReset = () => {
    setCsvFile(null)
    setParsedContacts([])
    setError("")
    setStep("upload")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    handleReset()
    setIsOpen(false)
  }

  const handleTagCreated = (newTag) => {
    if (onTagsUpdated) {
      onTagsUpdated()
    }
    setSelectedTags((prev) => [...prev, newTag.id])
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Import Contacts</DialogTitle>
            <DialogDescription>Upload a CSV file with your contacts and assign tags to them.</DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2 text-destructive">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Tabs value={step} className="flex-1 overflow-hidden flex flex-col">
            <TabsList>
              <TabsTrigger value="upload" disabled={step !== "upload"}>
                Upload CSV
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={step !== "preview"}>
                Preview & Tag
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="flex-1 flex flex-col">
              <div
                ref={dropZoneRef}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-2 ${isDragging ? "border-primary bg-primary/5" : "border-dashed"} rounded-md p-8 text-center flex flex-col items-center justify-center gap-4 transition-colors duration-200 cursor-pointer`}
              >
                <FileUp className={`h-10 w-10 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="font-medium">
                    {isDragging ? "Drop your file here" : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-sm text-muted-foreground">CSV files only (max 5MB)</p>
                </div>

                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">CSV Format Requirements</h3>
                <p className="text-sm text-muted-foreground mb-2">Your CSV file should have the following columns:</p>
                <div className="bg-muted p-3 rounded-md text-sm font-mono overflow-x-auto">
                  firstName,lastName,phone,email
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-hidden flex flex-col">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Label className="mb-2 block">Assign Tags to All Contacts</Label>
                  <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-[100px]">
                    {tags.map((tag) => (
                      <Button
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                        className="cursor-pointer h-7 hover:translate-y-0 hover:scale-105"
                        onClick={() => handleTagToggle(tag.id)}
                      >
                        {tag.name}
                        {selectedTags.includes(tag.id) && <X className="cursor-pointer ml-1 h-3 w-3" />}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedContacts.slice(0, 10).map((contact, index) => (
                      <TableRow key={index}>
                        <TableCell>{contact.firstName}</TableCell>
                        <TableCell>{contact.lastName}</TableCell>
                        <TableCell>{contact.phone}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {parsedContacts.length > 10 && (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Showing 10 of {parsedContacts.length} contacts
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            {step === "upload" ? (
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleReset}>
                  Back
                </Button>
                <Button onClick={handleImport} disabled={isImporting}>
                  {isImporting ? "Importing..." : `Import ${parsedContacts.length} Contacts`}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateTagDialog isOpen={isCreateTagOpen} setIsOpen={setIsCreateTagOpen} onTagCreated={handleTagCreated} />
    </>
  )
}
