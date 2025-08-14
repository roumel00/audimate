"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { InstructionList } from "@/components/instructions/instruction-list"
import { InstructionForm } from "@/components/instructions/instruction-form"

export default function ScriptsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [instructions, setInstructions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInstruction, setSelectedInstruction] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Fetch all instructions
  const fetchInstructions = async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await fetch("/api/instructions")

      if (!response.ok) {
        throw new Error("Failed to fetch instructions")
      }

      const data = await response.json()
      setInstructions(data.instructions)
    } catch (error) {
      console.error("Error fetching instructions:", error)
      setError("Failed to load instructions. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load instructions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchInstructions()
    }
  }, [session?.user?.id])

  // Handle creating a new instruction
  const handleCreateInstruction = async (instructionData) => {
    try {
      setIsSubmitting(true)
      setError("")

      const response = await fetch("/api/instructions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(instructionData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create instruction")
      }

      // Add new instruction to the list
      setInstructions((prevInstructions) => [...prevInstructions, data.instruction])

      // Exit creation mode
      setIsCreating(false)

      toast({
        title: "Instruction created",
        description: `Instruction "${data.instruction.name}" has been created successfully.`,
      })

      return true
    } catch (err) {
      setError(err.message)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle updating an instruction
  const handleUpdateInstruction = async (instructionData) => {
    try {
      setIsSubmitting(true)
      setError("")

      const response = await fetch(`/api/instructions/${selectedInstruction.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(instructionData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update instruction")
      }

      // Update instruction in the list
      setInstructions((prevInstructions) =>
        prevInstructions.map((instruction) =>
          instruction.id === selectedInstruction.id ? data.instruction : instruction,
        ),
      )

      // Exit edit mode
      setSelectedInstruction(null)

      toast({
        title: "Instruction updated",
        description: `Instruction "${data.instruction.name}" has been updated successfully.`,
      })

      return true
    } catch (err) {
      setError(err.message)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle deleting an instruction
  const handleDeleteInstruction = async (instructionId) => {
    try {
      const response = await fetch(`/api/instructions/${instructionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to delete instruction")
      }

      // Remove instruction from the list
      setInstructions((prevInstructions) => prevInstructions.filter((instruction) => instruction.id !== instructionId))

      toast({
        title: "Instruction deleted",
        description: "The instruction has been deleted successfully.",
      })
    } catch (err) {
      console.error("Error deleting instruction:", err)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
      throw err
    }
  }

  // Handle form submission (create or update)
  const handleSubmit = async (formData) => {
    if (selectedInstruction) {
      return handleUpdateInstruction(formData)
    } else {
      return handleCreateInstruction(formData)
    }
  }

  // Handle edit button click
  const handleEdit = (instruction) => {
    setSelectedInstruction(instruction)
    setIsCreating(false)
  }

  // Handle cancel button click
  const handleCancel = () => {
    setSelectedInstruction(null)
    setIsCreating(false)
  }

  // Handle create new button click
  const handleCreateNew = () => {
    setSelectedInstruction(null)
    setIsCreating(true)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Instruction Sets</h1>
        <p className="text-muted-foreground mt-1">Create and manage your AI calling instructions</p>
      </div>

      {isCreating || selectedInstruction ? (
        <div className="mb-6">
          <InstructionForm
            instruction={selectedInstruction}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </div>
      ) : (
        <div className="mb-6">
          <InstructionList
            instructions={instructions}
            onEdit={handleEdit}
            onDelete={handleDeleteInstruction}
            onCreateNew={handleCreateNew}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  )
}
