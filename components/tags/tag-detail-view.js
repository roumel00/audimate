"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tag, Edit } from "lucide-react"

export function TagDetailView({ tag }) {
  if (!tag) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            <CardTitle>Tag Details</CardTitle>
          </div>
        </div>
        <CardDescription>View complete tag information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Name</h3>
          <Badge variant="secondary" className="text-base font-medium px-3 py-1">
            {tag.name}
          </Badge>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
          <div className="bg-muted/30 rounded-md p-3 whitespace-pre-wrap">
            {tag.description || <span className="text-muted-foreground italic">No description provided</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
