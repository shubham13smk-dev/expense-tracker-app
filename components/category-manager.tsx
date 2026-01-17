"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Category } from "@/lib/types"
import { Plus, Pencil, Trash2, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  onAddCategory: (category: Omit<Category, "id">) => void
  onUpdateCategory: (id: string, updates: Partial<Category>) => void
  onDeleteCategory: (id: string) => void
}

const EMOJI_OPTIONS = [
  "🍔",
  "🚕",
  "🛍",
  "💡",
  "🎮",
  "🏥",
  "📦",
  "☕",
  "🎬",
  "✈️",
  "📱",
  "🏠",
  "🎓",
  "💪",
  "🎁",
  "🔧",
  "📚",
  "🎵",
  "🐕",
  "💼",
]

const COLOR_OPTIONS = [
  "hsl(24, 100%, 50%)",
  "hsl(210, 100%, 50%)",
  "hsl(330, 100%, 50%)",
  "hsl(45, 100%, 50%)",
  "hsl(270, 100%, 50%)",
  "hsl(150, 100%, 40%)",
  "hsl(0, 100%, 50%)",
  "hsl(180, 100%, 40%)",
  "hsl(300, 100%, 50%)",
  "hsl(60, 100%, 45%)",
]

export function CategoryManager({
  open,
  onOpenChange,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [icon, setIcon] = useState(EMOJI_OPTIONS[0])
  const [color, setColor] = useState(COLOR_OPTIONS[0])

  const resetForm = () => {
    setName("")
    setIcon(EMOJI_OPTIONS[0])
    setColor(COLOR_OPTIONS[0])
    setShowAddForm(false)
    setEditingId(null)
  }

  const handleAdd = () => {
    if (!name.trim()) return
    onAddCategory({ name: name.trim(), icon, color })
    resetForm()
  }

  const handleUpdate = () => {
    if (!editingId || !name.trim()) return
    onUpdateCategory(editingId, { name: name.trim(), icon, color })
    resetForm()
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setName(category.name)
    setIcon(category.icon)
    setColor(category.color)
    setShowAddForm(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category List */}
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-3",
                  editingId === category.id ? "border-primary bg-primary/5" : "border-border",
                )}
              >
                {editingId === category.id ? (
                  <div className="flex-1 space-y-3">
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
                    <div className="flex flex-wrap gap-2">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setIcon(emoji)}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded border text-lg transition-colors",
                            icon === emoji ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={cn(
                            "h-6 w-6 rounded-full border-2 transition-transform",
                            color === c ? "scale-110 border-foreground" : "border-transparent hover:scale-105",
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={resetForm}>
                        <X className="mr-1 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleUpdate}>
                        <Check className="mr-1 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                        style={{ backgroundColor: category.color + "20" }}
                      >
                        {category.icon}
                      </span>
                      <span className="font-medium text-foreground">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(category)}
                        className="rounded p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        aria-label="Edit category"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCategory(category.id)}
                        className="rounded p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add New Category */}
          {showAddForm ? (
            <div className="space-y-3 rounded-lg border border-primary bg-primary/5 p-3">
              <Label>New Category</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" autoFocus />
              <div>
                <Label className="text-xs text-muted-foreground">Icon</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded border text-lg transition-colors",
                        icon === emoji ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Color</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "h-6 w-6 rounded-full border-2 transition-transform",
                        color === c ? "scale-110 border-foreground" : "border-transparent hover:scale-105",
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAdd}>
                  Add Category
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                resetForm()
                setShowAddForm(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Category
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
