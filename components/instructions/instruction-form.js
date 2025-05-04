"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  MessageSquare,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

export function InstructionForm({ instruction, onSubmit, onCancel, isLoading }) {
  const OFFERING_CHAR_LIMIT = 500
  const ADDITIONAL_DETAILS_CHAR_LIMIT = 1000

  const [formData, setFormData] = useState({
    name: "",
    offering: "",
    currentScript: "",
    accent: "Australian",
    objections: [],
  })
  const [scriptTab, setScriptTab] = useState("manual")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [newObjection, setNewObjection] = useState({ objection: "", answer: "" })
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)
  const [additionalDetails, setAdditionalDetails] = useState("")
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)
  const { toast } = useToast()

  // Initialize form data when instruction changes
  useEffect(() => {
    if (instruction) {
      setFormData({
        name: instruction.name || "",
        offering: instruction.offering || "",
        currentScript: instruction.currentScript || "",
        accent: instruction.accent || "Australian",
        objections: instruction.objections || [],
      })
    } else {
      setFormData({
        name: "",
        offering: "",
        currentScript: "",
        accent: "Australian",
        objections: [],
      })
    }
  }, [instruction])

  const handleChange = (e) => {
    const { name, value } = e.target

    // Apply character limits
    if (name === "offering" && value.length > OFFERING_CHAR_LIMIT) {
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const processFile = async (file) => {
    if (!file) return

    setIsProcessing(true)
    setError("")

    try {
      // Check file type
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        // For .txt files, use FileReader
        const reader = new FileReader()
        reader.onload = (e) => {
          setFormData((prev) => ({ ...prev, currentScript: e.target.result }))
          setIsProcessing(false)
        }
        reader.onerror = () => {
          setError("Error reading file")
          setIsProcessing(false)
        }
        reader.readAsText(file)
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        // For .docx files, we need to send to the server for processing
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/instructions/parse-docx", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || "Failed to parse Word document")
        }

        const data = await response.json()
        setFormData((prev) => ({ ...prev, currentScript: data.text }))
      } else {
        throw new Error("Please upload a .txt or .docx file")
      }
    } catch (err) {
      console.error("Error processing file:", err)
      setError(err.message || "Failed to process file")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    processFile(file)
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
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

  const handleGenerateScript = async () => {
    if (!formData.offering.trim()) {
      toast({
        title: "Offering required",
        description: "Please provide an offering description before generating a script.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsGeneratingScript(true)
      setError("")

      const response = await fetch("/api/instructions/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offering: formData.offering,
          additionalDetails: additionalDetails,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate script")
      }

      const data = await response.json()

      if (data.result) {
        setFormData((prev) => ({
          ...prev,
          currentScript: data.result,
        }))

        // Switch to manual tab to show the generated script
        setScriptTab("manual")

        toast({
          title: "Script generated",
          description: "Your script has been generated successfully.",
        })
      } else {
        throw new Error("No script was generated")
      }
    } catch (error) {
      console.error("Error generating script:", error)
      setError(error.message || "Failed to generate script")
    } finally {
      setIsGeneratingScript(false)
    }
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
          offering: "",
          currentScript: "",
          accent: "Australian",
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

            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="offering" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  Offering
                </Label>
                <div className="space-y-1">
                  <Textarea
                    id="offering"
                    name="offering"
                    value={formData.offering}
                    onChange={handleChange}
                    placeholder="What product or service is being offered?"
                    className={`min-h-[100px] ${
                      formData.offering.length >= OFFERING_CHAR_LIMIT
                        ? "border-destructive"
                        : formData.offering.length >= OFFERING_CHAR_LIMIT * 0.8
                          ? "border-amber-500"
                          : ""
                    }`}
                    maxLength={OFFERING_CHAR_LIMIT}
                  />
                  <div className="flex justify-end">
                    <span
                      className={`text-xs ${
                        formData.offering.length >= OFFERING_CHAR_LIMIT
                          ? "text-destructive"
                          : formData.offering.length >= OFFERING_CHAR_LIMIT * 0.8
                            ? "text-amber-500"
                            : "text-muted-foreground"
                      }`}
                    >
                      {formData.offering.length}/{OFFERING_CHAR_LIMIT} characters
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Voice Accent
              </Label>
              <select
                id="accent"
                name="accent"
                value={formData.accent}
                onChange={handleChange}
                className="cursor-pointer flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="American">American</option>
                <option value="British">British</option>
                <option value="Australian">Australian</option>
              </select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Script</Label>
              <Tabs value={scriptTab} onValueChange={setScriptTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="manual" className={"cursor-pointer"}>
                    Manual Entry
                  </TabsTrigger>
                  <Separator className={"mx-2 bg-primary"} orientation="vertical" />
                  <TabsTrigger value="upload" className={"cursor-pointer"}>
                    Upload File
                  </TabsTrigger>
                  <Separator className={"mx-2 bg-primary"} orientation="vertical" />
                  <TabsTrigger value="generate" className={"cursor-pointer"}>
                    Generate Script
                  </TabsTrigger>
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
                  <div
                    ref={dropZoneRef}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 ${isDragging ? "border-primary bg-primary/5" : "border-dashed"} rounded-md p-8 text-center flex flex-col items-center justify-center gap-4 transition-colors duration-200 cursor-pointer`}
                  >
                    <Upload className={`h-10 w-10 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-medium">
                        {isDragging ? "Drop your file here" : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-sm text-muted-foreground">TXT or DOCX files only (max 5MB)</p>
                    </div>

                    {/* Hidden file input */}
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {isProcessing && (
                    <div className="mt-4 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Processing your file...</p>
                    </div>
                  )}

                  {formData.currentScript && !isProcessing && (
                    <div className="mt-4">
                      <Label>Preview</Label>
                      <div className="border rounded-md p-4 mt-2 max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                        {formData.currentScript}
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="generate" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="additionalDetails" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        Script Requirements
                      </Label>
                      <div className="space-y-1">
                        <Textarea
                          id="additionalDetails"
                          value={additionalDetails}
                          onChange={(e) => setAdditionalDetails(e.target.value)}
                          placeholder="Provide any specific requirements, tone preferences, or details for the script generation"
                          className={`min-h-[100px] ${
                            additionalDetails.length >= ADDITIONAL_DETAILS_CHAR_LIMIT
                              ? "border-destructive"
                              : additionalDetails.length >= ADDITIONAL_DETAILS_CHAR_LIMIT * 0.8
                                ? "border-amber-500"
                                : ""
                          }`}
                          maxLength={ADDITIONAL_DETAILS_CHAR_LIMIT}
                        />
                        <div className="flex justify-end">
                          <span
                            className={`text-xs ${
                              additionalDetails.length >= ADDITIONAL_DETAILS_CHAR_LIMIT
                                ? "text-destructive"
                                : additionalDetails.length >= ADDITIONAL_DETAILS_CHAR_LIMIT * 0.8
                                  ? "text-amber-500"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {additionalDetails.length}/{ADDITIONAL_DETAILS_CHAR_LIMIT} characters
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          type="button"
                          onClick={handleGenerateScript}
                          disabled={isGeneratingScript || !formData.offering.trim()}
                          className="flex items-center gap-2"
                        >
                          {isGeneratingScript ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Generating Script...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Generate Script
                            </>
                          )}
                        </Button>

                        {!formData.offering.trim() && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Please enter an offering description first
                          </p>
                        )}
                      </div>
                    </div>

                    {formData.currentScript && (
                      <div className="mt-4">
                        <Label>Generated Script</Label>
                        <div className="border rounded-md p-4 mt-2 max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                          {formData.currentScript}
                        </div>
                      </div>
                    )}
                  </div>
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
                      Save Objection
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
