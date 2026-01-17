"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { Expense, Category, Budget, Settings } from "@/lib/types"
import {
  getCategoryBreakdown,
  generateInsights,
  getDailyExpenses,
  getMonthlyProjection,
  compareMonths,
} from "@/lib/analytics"
import { ExpenseChart } from "./expense-chart"
import { TrendingUp, TrendingDown, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalyticsProps {
  expenses: Expense[]
  categories: Category[]
  budgets: Budget[]
  settings: Settings
}

export function Analytics({ expenses, categories, budgets, settings }: AnalyticsProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  const categoryBreakdown = useMemo(() => getCategoryBreakdown(expenses, selectedMonth), [expenses, selectedMonth])

  const insights = useMemo(() => generateInsights(expenses, budgets), [expenses, budgets])

  const dailyExpenses = useMemo(() => getDailyExpenses(expenses, selectedMonth), [expenses, selectedMonth])

  const projection = useMemo(() => getMonthlyProjection(expenses, selectedMonth), [expenses, selectedMonth])

  const comparison = useMemo(() => compareMonths(expenses, selectedMonth), [expenses, selectedMonth])

  const getCategoryColor = (categoryName: string) => {
    const cat = categories.find((c) => c.name === categoryName)
    return cat?.color || "hsl(0, 0%, 50%)"
  }

  const pieData = categoryBreakdown.map((item) => ({
    name: item.category,
    value: item.amount,
    color: getCategoryColor(item.category),
  }))

  const formatCurrency = (amount: number) => {
    return `${settings.currencySymbol}${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    const now = new Date()
    setSelectedMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      if (newDate > now) return prev
      return newDate
    })
  }

  const monthName = selectedMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  const isCurrentMonth =
    selectedMonth.getMonth() === new Date().getMonth() && selectedMonth.getFullYear() === new Date().getFullYear()

  return (
    <div className="space-y-4 p-4">
      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <button onClick={handlePreviousMonth} className="rounded-lg p-2 hover:bg-secondary" aria-label="Previous month">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">{monthName}</h2>
        <button
          onClick={handleNextMonth}
          disabled={isCurrentMonth}
          className={cn("rounded-lg p-2", isCurrentMonth ? "text-muted-foreground/30" : "hover:bg-secondary")}
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Comparison Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">vs Last Month</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(comparison.current)}</p>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium",
                comparison.change > 0
                  ? "bg-destructive/10 text-destructive"
                  : comparison.change < 0
                    ? "bg-success/10 text-success"
                    : "bg-secondary text-secondary-foreground",
              )}
            >
              {comparison.change > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : comparison.change < 0 ? (
                <TrendingDown className="h-4 w-4" />
              ) : null}
              {comparison.change !== 0 ? `${Math.abs(comparison.change).toFixed(0)}%` : "No change"}
            </div>
          </div>
          {isCurrentMonth && (
            <p className="mt-2 text-sm text-muted-foreground">Projected: {formatCurrency(projection)}</p>
          )}
        </CardContent>
      </Card>

      {/* Daily Trend Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Daily Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseChart data={dailyExpenses} settings={settings} />
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend formatter={(value) => <span className="text-sm text-foreground">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No expenses this month</p>
          )}
        </CardContent>
      </Card>

      {/* Category List */}
      {categoryBreakdown.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {categoryBreakdown.map((item) => {
                const cat = categories.find((c) => c.name === item.category)
                return (
                  <li key={item.category} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                        style={{
                          backgroundColor: getCategoryColor(item.category) + "20",
                        }}
                      >
                        {cat?.icon || "📦"}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{item.category}</p>
                        <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}% of total</p>
                      </div>
                    </div>
                    <p className="font-semibold text-foreground">{formatCurrency(item.amount)}</p>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Lightbulb className="h-4 w-4 text-primary" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  {insight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
