"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Expense, Category, Settings } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  settings: Settings
  expense?: Expense | null
  onSave: (data: Omit<Expense, "id" | "createdAt">) => void
}

export function AddExpenseDialog({ open, onOpenChange, categories, settings, expense, onSave }: AddExpenseDialogProps) {
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      if (expense) {
        setAmount(expense.amount.toString())
        setCategory(expense.category)
        setDate(expense.date)
        setNote(expense.note || "")
      } else {
        setAmount("")
        setCategory(categories[0]?.name || "Other")
        setDate(new Date().toISOString().split("T")[0])
        setNote("")
      }
      setError("")
    }
  }, [open, expense, categories])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const parsedAmount = Number.parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (!category) {
      setError("Please select a category")
      return
    }

    if (!date) {
      setError("Please select a date")
      return
    }

    onSave({
      amount: parsedAmount,
      category,
      date,
      note: note.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({settings.currencySymbol})</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl font-semibold"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors",
                    category === cat.name ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                  )}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs text-muted-foreground truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" placeholder="Add a note..." value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {expense ? "Update" : "Add"} Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
