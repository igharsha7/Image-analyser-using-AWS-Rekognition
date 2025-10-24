"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedLabels: string[]
  onLabelsChange: (labels: string[]) => void
  allLabels: string[]
  hasFacesOnly: boolean
  onHasFacesChange: (value: boolean) => void
  onClearFilters: () => void
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedLabels,
  onLabelsChange,
  allLabels,
  hasFacesOnly,
  onHasFacesChange,
  onClearFilters,
}: FilterBarProps) {
  const hasActiveFilters = searchQuery || selectedLabels.length > 0 || hasFacesOnly

  return (
    <Card className="mb-8 border-border/50 bg-card/50 p-4">
      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <Input
            type="text"
            placeholder="Search by label..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-border/50 bg-input text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Label Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border/50 bg-transparent">
                Labels {selectedLabels.length > 0 && `(${selectedLabels.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {allLabels.map((label) => (
                <DropdownMenuCheckboxItem
                  key={label}
                  checked={selectedLabels.includes(label)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onLabelsChange([...selectedLabels, label])
                    } else {
                      onLabelsChange(selectedLabels.filter((l) => l !== label))
                    }
                  }}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Has Faces Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="has-faces"
              checked={hasFacesOnly}
              onCheckedChange={(checked) => onHasFacesChange(checked as boolean)}
            />
            <label htmlFor="has-faces" className="text-sm font-medium cursor-pointer">
              Has Faces
            </label>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
