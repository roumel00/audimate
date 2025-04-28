"use client"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp } from "lucide-react"
import { TagTableRow } from "./tag-table-row"
import { EmptyTagsState } from "./empty-tags-state"

export function TagsTable({
  tags,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  searchQuery,
  isCreatingTag,
  onCreateTagClick,
  onTagSelect,
}) {
  if (tags.length === 0) {
    return (
      <EmptyTagsState searchQuery={searchQuery} isCreatingTag={isCreatingTag} onCreateTagClick={onCreateTagClick} />
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer w-[200px]" onClick={() => onSort("name")}>
              <div className="flex items-center gap-1">
                Name
                {sortField === "name" &&
                  (sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => onSort("description")}>
              <div className="flex items-center gap-1">
                Description
                {sortField === "description" &&
                  (sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
              </div>
            </TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TagTableRow
              key={tag.id}
              tag={tag}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={() => onTagSelect && onTagSelect(tag)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
