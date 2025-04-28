"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

export function ContactsTable({ contacts, tags, selectedContacts, onSelectContact, onSelectAll, onRowClick }) {
  const allSelected = contacts.length > 0 && selectedContacts.length === contacts.length
  const someSelected = selectedContacts.length > 0 && selectedContacts.length < contacts.length

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={(checked) => onSelectAll(checked)}
                aria-label="Select all contacts"
              />
            </TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id} className="cursor-pointer" onClick={() => onRowClick(contact)}>
              <TableCell className="w-[50px]" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  onCheckedChange={(checked) => onSelectContact(contact.id, checked)}
                  aria-label={`Select ${contact.firstName} ${contact.lastName}`}
                />
              </TableCell>
              <TableCell className="font-medium">{contact.firstName}</TableCell>
              <TableCell>{contact.lastName}</TableCell>
              <TableCell>{contact.phone}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {contact.tags && contact.tags.length > 0 ? (
                    contact.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">No tags</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
