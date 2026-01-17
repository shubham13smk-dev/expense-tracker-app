import type { Expense, Budget } from "./types"

export function getMonthlyTotal(expenses: Expense[], date: Date = new Date()): number {
  const month = date.getMonth()
  const year = date.getFullYear()

  return expenses
    .filter((e) => {
      const expenseDate = new Date(e.date)
      return expenseDate.getMonth() === month && expenseDate.getFullYear() === year
    })
    .reduce((sum, e) => sum + e.amount, 0)
}

export function getDailyExpenses(expenses: Expense[], date: Date = new Date()): { day: number; amount: number }[] {
  const month = date.getMonth()
  const year = date.getFullYear()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const dailyMap = new Map<number, number>()

  expenses
    .filter((e) => {
      const expenseDate = new Date(e.date)
      return expenseDate.getMonth() === month && expenseDate.getFullYear() === year
    })
    .forEach((e) => {
      const day = new Date(e.date).getDate()
      dailyMap.set(day, (dailyMap.get(day) || 0) + e.amount)
    })

  return Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    amount: dailyMap.get(i + 1) || 0,
  }))
}

export function getCategoryBreakdown(
  expenses: Expense[],
  date: Date = new Date(),
): { category: string; amount: number; percentage: number }[] {
  const month = date.getMonth()
  const year = date.getFullYear()

  const categoryMap = new Map<string, number>()
  let total = 0

  expenses
    .filter((e) => {
      const expenseDate = new Date(e.date)
      return expenseDate.getMonth() === month && expenseDate.getFullYear() === year
    })
    .forEach((e) => {
      categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount)
      total += e.amount
    })

  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function getWeeklyTotal(expenses: Expense[], date: Date = new Date()): number {
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - date.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  return expenses
    .filter((e) => {
      const expenseDate = new Date(e.date)
      return expenseDate >= startOfWeek && expenseDate < endOfWeek
    })
    .reduce((sum, e) => sum + e.amount, 0)
}

export function getDailyAverage(expenses: Expense[], date: Date = new Date()): number {
  const month = date.getMonth()
  const year = date.getFullYear()
  const today = date.getDate()

  const monthlyExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.date)
    return expenseDate.getMonth() === month && expenseDate.getFullYear() === year
  })

  const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0)
  return today > 0 ? total / today : 0
}

export function getMonthlyProjection(expenses: Expense[], date: Date = new Date()): number {
  const dailyAvg = getDailyAverage(expenses, date)
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return dailyAvg * daysInMonth
}

export function compareMonths(
  expenses: Expense[],
  date: Date = new Date(),
): { current: number; previous: number; change: number } {
  const currentMonth = getMonthlyTotal(expenses, date)

  const previousDate = new Date(date)
  previousDate.setMonth(date.getMonth() - 1)
  const previousMonth = getMonthlyTotal(expenses, previousDate)

  const change = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0

  return { current: currentMonth, previous: previousMonth, change }
}

export function getBudgetStatus(
  expenses: Expense[],
  budgets: Budget[],
  date: Date = new Date(),
): {
  category: string | null
  budget: number
  spent: number
  percentage: number
  status: "safe" | "warning" | "danger" | "exceeded"
}[] {
  const month = date.getMonth()
  const year = date.getFullYear()

  return budgets
    .filter((b) => b.period === "monthly")
    .map((budget) => {
      const spent =
        budget.category === null
          ? getMonthlyTotal(expenses, date)
          : expenses
              .filter((e) => {
                const expenseDate = new Date(e.date)
                return (
                  expenseDate.getMonth() === month &&
                  expenseDate.getFullYear() === year &&
                  e.category === budget.category
                )
              })
              .reduce((sum, e) => sum + e.amount, 0)

      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

      let status: "safe" | "warning" | "danger" | "exceeded"
      if (percentage >= 100) status = "exceeded"
      else if (percentage >= 90) status = "danger"
      else if (percentage >= 75) status = "warning"
      else status = "safe"

      return {
        category: budget.category,
        budget: budget.amount,
        spent,
        percentage,
        status,
      }
    })
}

export function detectSpendingSpikes(
  expenses: Expense[],
  threshold = 2,
): { date: string; amount: number; average: number }[] {
  const dailyExpenses = getDailyExpenses(expenses)
  const amounts = dailyExpenses.map((d) => d.amount).filter((a) => a > 0)
  const average = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0

  return dailyExpenses
    .filter((d) => d.amount > average * threshold)
    .map((d) => ({
      date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`,
      amount: d.amount,
      average,
    }))
}

export function generateInsights(expenses: Expense[], budgets: Budget[]): string[] {
  const insights: string[] = []
  const now = new Date()

  const comparison = compareMonths(expenses, now)
  if (comparison.change > 0) {
    insights.push(`You spent ${Math.abs(comparison.change).toFixed(0)}% more this month compared to last month`)
  } else if (comparison.change < 0) {
    insights.push(`Great job! You spent ${Math.abs(comparison.change).toFixed(0)}% less this month`)
  }

  const categoryBreakdown = getCategoryBreakdown(expenses, now)
  if (categoryBreakdown.length > 0) {
    const topCategory = categoryBreakdown[0]
    insights.push(`${topCategory.category} is your highest spending category at ${topCategory.percentage.toFixed(0)}%`)
  }

  const projection = getMonthlyProjection(expenses, now)
  const budgetStatus = getBudgetStatus(expenses, budgets, now)
  const overallBudget = budgetStatus.find((b) => b.category === null)

  if (overallBudget && projection > overallBudget.budget) {
    const daysRemaining = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()
    insights.push(`At current pace, you may exceed your budget in ${daysRemaining} days`)
  }

  const spikes = detectSpendingSpikes(expenses)
  if (spikes.length > 0) {
    insights.push(`Detected ${spikes.length} unusual spending spike${spikes.length > 1 ? "s" : ""} this month`)
  }

  const dailyAvg = getDailyAverage(expenses, now)
  if (dailyAvg > 0) {
    insights.push(`Your average daily spending is ₹${dailyAvg.toFixed(0)}`)
  }

  return insights
}
