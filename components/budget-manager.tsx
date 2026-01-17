"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Budget, Category, Expense, Settings } from "@/lib/types"
import { getBudgetStatus } from "@/lib/analytics"
import { Plus, Trash2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface BudgetManagerProps {
  budgets: Budget[]
  categories: Category[]
  expenses: Expense[]
  settings: Settings
  onSetBudget: (budget: Omit<Budget, "id">) => void
  onDeleteBudget: (id: string) => void
}

export function BudgetManager({
  budgets,
  categories,
  expenses,
  settings,
  onSetBudget,
  onDeleteBudget,
}: BudgetManagerProps) {
  const [showAddBudget, setShowAddBudget] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [budgetAmount, setBudgetAmount] = useState("")

  const budgetStatus = getBudgetStatus(expenses, budgets)

  const formatCurrency = (amount: number) => {
    return `${settings.currencySymbol}${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  const handleSaveBudget = () => {
    const amount = Number.parseFloat(budgetAmount)
    if (isNaN(amount) || amount <= 0) return

    onSetBudget({
      category: selectedCategory,
      amount,
      period: "monthly",
    })

    setShowAddBudget(false)
    setBudgetAmount("")
    setSelectedCategory(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-success"
      case "warning":
        return "bg-warning"
      case "danger":
        return "bg-destructive"
      case "exceeded":
        return "bg-destructive"
      default:
        return "bg-muted"
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-success/10"
      case "warning":
        return "bg-warning/10"
      case "danger":
        return "bg-destructive/10"
      case "exceeded":
        return "bg-destructive/10"
      default:
        return "bg-muted"
    }
  }

  const overallBudget = budgetStatus.find((b) => b.category === null)

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Budget</h1>
        <Button size="sm" onClick={() => setShowAddBudget(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Set Budget
        </Button>
      </div>

      {/* Overall Budget */}
      {overallBudget ? (
        <Card className={cn("border-border", getStatusBgColor(overallBudget.status))}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>Overall Monthly Budget</span>
              {overallBudget.status !== "safe" && (
                <AlertTriangle
                  className={cn("h-4 w-4", overallBudget.status === "warning" ? "text-warning" : "text-destructive")}
                />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground">{formatCurrency(overallBudget.spent)}</span>
              <span className="text-sm text-muted-foreground">of {formatCurrency(overallBudget.budget)}</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn("h-full transition-all", getStatusColor(overallBudget.status))}
                style={{
                  width: `${Math.min(overallBudget.percentage, 100)}%`,
                }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {overallBudget.percentage.toFixed(0)}% used
              {overallBudget.percentage >= 100 && " - Budget exceeded!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="mb-2 text-sm text-muted-foreground">No overall budget set</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory(null)
                setShowAddBudget(true)
              }}
            >
              Set Overall Budget
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Category Budgets */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Category Budgets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {budgetStatus.filter((b) => b.category !== null).length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No category budgets set</p>
          ) : (
            <ul className="divide-y divide-border">
              {budgetStatus
                .filter((b) => b.category !== null)
                .map((item) => {
                  const cat = categories.find((c) => c.name === item.category)
                  const budget = budgets.find((b) => b.category === item.category)
                  return (
                    <li key={item.category} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                            style={{
                              backgroundColor: (cat?.color || "#666") + "20",
                            }}
                          >
                            {cat?.icon || "📦"}
                          </span>
                          <div>
                            <p className="font-medium text-foreground">{item.category}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(item.spent)} of {formatCurrency(item.budget)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.status !== "safe" && (
                            <AlertTriangle
                              className={cn("h-4 w-4", item.status === "warning" ? "text-warning" : "text-destructive")}
                            />
                          )}
                          <button
                            onClick={() => budget && onDeleteBudget(budget.id)}
                            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Delete budget"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn("h-full transition-all", getStatusColor(item.status))}
                          style={{
                            width: `${Math.min(item.percentage, 100)}%`,
                          }}
                        />
                      </div>
                    </li>
                  )
                })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Budget Alerts Info */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Alert Thresholds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-warning" />
              <span className="text-muted-foreground">Warning at 75% of budget</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Danger at 90% of budget</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Exceeded at 100% of budget</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Budget Dialog */}
      <Dialog open={showAddBudget} onOpenChange={setShowAddBudget}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors",
                    selectedCategory === null
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <span className="text-xl">💰</span>
                  <span className="text-xs text-muted-foreground">Overall</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors",
                      selectedCategory === cat.name
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs text-muted-foreground truncate w-full text-center">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-amount">Monthly Budget ({settings.currencySymbol})</Label>
              <Input
                id="budget-amount"
                type="number"
                step="100"
                min="0"
                placeholder="10000"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="text-xl font-semibold"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAddBudget(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveBudget}>
                Save Budget
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
