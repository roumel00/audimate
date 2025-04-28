"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, FileText, MessageSquare, Plus, ShoppingBag, Trash2, Upload } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function InstructionForm({ instruction, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    greeting: "",
    offering: "",
    currentScript: "",
    objections: [],
  })
  const [scriptTab, setScriptTab] = useState("manual")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [newObjection, setNewObjection] = useState({ objection: "", answer: "" })
  const fileInputRef = useRef(null)

  // Initialize form data when instruction changes
  useEffect(() => {
    if (instruction) {
      setFormData({
        name: instruction.name || "",
        greeting: instruction.greeting || "",
        offering: instruction.offering || "",
        currentScript: instruction.currentScript || "",
        objections: instruction.objections || [],
      })
    } else {
      setFormData({
        name: "",
        greeting: "",
        offering: "",
        currentScript: "",
        objections: [],
      })
    }
  }, [instruction])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file type
    if (file.type !== "text/plain" && !file.name.endsWith(".docx")) {
      setError("Please upload a .txt or .docx file")
      return
    }

    // For .txt files, use FileReader
    if (file.type === "text/plain") {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, currentScript: e.target.result }))
      }
      reader.onerror = () => {
        setError("Error reading file")
      }
      reader.readAsText(file)
    } else {
      // For .docx files, we would need a server-side solution or a library
      // For now, just show an error
      setError("DOCX files are not supported in this demo. Please use .txt files.")
    }
  }

  const handleAddObjection = () => {
    if (!newObjection.objection.trim() || !newObjection.answer.trim()) {
      return
    }

    setFormData((prev) => ({
      ...prev,
      objections: [...prev.objections, { ...newObjection }],
    }))

    setNewObjection({ objection: "", answer: "" })
  }

  const handleRemoveObjection = (index) => {
    setFormData((prev) => ({
      ...prev,
      objections: prev.objections.filter((_, i) => i !== index),
    }))
  }

  const handleObjectionChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedObjections = [...prev.objections]
      updatedObjections[index] = {
        ...updatedObjections[index],
        [field]: value,
      }
      return { ...prev, objections: updatedObjections }
    })
  }

  const handleNewObjectionChange = (field, value) => {
    setNewObjection((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      await onSubmit(formData)
      setSuccess("Instruction saved successfully!")

      // Only reset form if it's a new instruction (not editing)
      if (!instruction) {
        setFormData({
          name: "",
          greeting: "",
          offering: "",
          currentScript: "",
          objections: [],
        })
        setNewObjection({ objection: "", answer: "" })
      }
    } catch (err) {
      setError(err.message || "Failed to save instruction")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {instruction ? "Edit Instruction Set" : "Create New Instruction Set"}
          </CardTitle>
          <CardDescription>
            {instruction
              ? "Update your instruction set for AI-powered calls"
              : "Create a new instruction set for AI-powered calls"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2 text-destructive">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md flex items-start gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Instruction Set Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter a name for this instruction set"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="greeting" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  Opening Greeting
                </Label>
                <Textarea
                  id="greeting"
                  name="greeting"
                  value={formData.greeting}
                  onChange={handleChange}
                  placeholder="Enter the opening greeting for the call"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offering" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  Offering
                </Label>
                <Textarea
                  id="offering"
                  name="offering"
                  value={formData.offering}
                  onChange={handleChange}
                  placeholder="What product or service is being offered?"
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Script</Label>
              <Tabs value={scriptTab} onValueChange={setScriptTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="space-y-4">
                  <Textarea
                    name="currentScript"
                    value={formData.currentScript}
                    onChange={handleChange}
                    placeholder="Enter your script here..."
                    className="min-h-[200px]"
                  />
                </TabsContent>
                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed rounded-md p-8 text-center flex flex-col items-center justify-center gap-4">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">TXT files only (max 5MB)</p>
                    </div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="max-w-xs"
                    />
                  </div>

                  {formData.currentScript && (
                    <div className="mt-4">
                      <Label>Preview</Label>
                      <div className="border rounded-md p-4 mt-2 max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                        {formData.currentScript}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Objections and Answers</Label>
                <p className="text-sm text-muted-foreground">{formData.objections.length} objections added</p>
              </div>

              {formData.objections.length > 0 && (
                <div className="space-y-4">
                  {formData.objections.map((obj, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/30"
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`objection-${index}`}>Objection</Label>
                        <div className="flex gap-2">
                          <Input
                            id={`objection-${index}`}
                            value={obj.objection}
                            onChange={(e) => handleObjectionChange(index, "objection", e.target.value)}
                            placeholder="Customer objection"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveObjection(index)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`answer-${index}`}>Answer</Label>
                        <Textarea
                          id={`answer-${index}`}
                          value={obj.answer}
                          onChange={(e) => handleObjectionChange(index, "answer", e.target.value)}
                          placeholder="Your response to the objection"
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md border-dashed">
                <div className="space-y-2">
                  <Label htmlFor="new-objection">New Objection</Label>
                  <Input
                    id="new-objection"
                    value={newObjection.objection}
                    onChange={(e) => handleNewObjectionChange("objection", e.target.value)}
                    placeholder="Enter a potential customer objection"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-answer">Answer</Label>
                  <div className="flex flex-col gap-2">
                    <Textarea
                      id="new-answer"
                      value={newObjection.answer}
                      onChange={(e) => handleNewObjectionChange("answer", e.target.value)}
                      placeholder="Enter your response to this objection"
                      className="min-h-[80px]"
                    />
                    <Button
                      type="button"
                      onClick={handleAddObjection}
                      disabled={!newObjection.objection.trim() || !newObjection.answer.trim()}
                      className="self-end"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Objection
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !formData.name.trim()}>
            {isLoading ? "Saving..." : instruction ? "Update Instruction" : "Save Instruction"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
