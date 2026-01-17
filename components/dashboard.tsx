"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import type { Expense, Category, Budget, Settings } from "@/lib/types"
import { getMonthlyTotal, getDailyExpenses, compareMonths, getDailyAverage, getWeeklyTotal } from "@/lib/analytics"
import { ExpenseChart } from "./expense-chart"
import { cn } from "@/lib/utils"

interface DashboardProps {
  expenses: Expense[]
  categories: Category[]
  budgets: Budget[]
  settings: Settings
  onQuickAdd: (amount: number) => void
  onEditExpense: (expense: Expense) => void
  onDeleteExpense: (id: string) => void
}

export function Dashboard({
  expenses,
  categories,
  budgets,
  settings,
  onQuickAdd,
  onEditExpense,
  onDeleteExpense,
}: DashboardProps) {
  const now = new Date()
  const monthName = now.toLocaleString("default", { month: "long" })

  const monthlyTotal = useMemo(() => getMonthlyTotal(expenses), [expenses])
  const weeklyTotal = useMemo(() => getWeeklyTotal(expenses), [expenses])
  const dailyAverage = useMemo(() => getDailyAverage(expenses), [expenses])
  const dailyExpenses = useMemo(() => getDailyExpenses(expenses), [expenses])
  const comparison = useMemo(() => compareMonths(expenses), [expenses])

  const recentExpenses = useMemo(() => expenses.slice(0, 10), [expenses])

  const getCategoryInfo = (categoryName: string) => {
    return (
      categories.find((c) => c.name === categoryName) || {
        name: categoryName,
        icon: "📦",
        color: "hsl(0, 0%, 50%)",
      }
    )
  }

  const formatCurrency = (amount: number) => {
    return `${settings.currencySymbol}${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`
  }

  const quickAddAmounts = [1, 5, 50, 0.1]

  return (
    <div className="space-y-4 p-4">
      {/* Monthly Summary Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Spent This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{formatCurrency(monthlyTotal)}</span>
            {comparison.change !== 0 && (
              <span
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  comparison.change > 0 ? "text-destructive" : "text-success",
                )}
              >
                {comparison.change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(comparison.change).toFixed(0)}%
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{monthName}</p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Weekly</p>
            <p className="text-xl font-semibold text-foreground">{formatCurrency(weeklyTotal)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Daily Avg</p>
            <p className="text-xl font-semibold text-foreground">{formatCurrency(dailyAverage)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Expense Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{monthName} Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseChart data={dailyExpenses} settings={settings} />
        </CardContent>
      </Card>

      {/* Quick Add Buttons */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Quick add:</span>
        <div className="flex flex-wrap gap-2">
          {quickAddAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => onQuickAdd(amount)}
              className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              {formatCurrency(amount)}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentExpenses.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No expenses yet. Start tracking!</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentExpenses.map((expense) => {
                const categoryInfo = getCategoryInfo(expense.category)
                return (
                  <li key={expense.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                        style={{ backgroundColor: categoryInfo.color + "20" }}
                      >
                        {categoryInfo.icon}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{formatCurrency(expense.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.category}
                          {expense.note && ` • ${expense.note}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <button
                        onClick={() => onEditExpense(expense)}
                        className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        aria-label="Edit expense"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
