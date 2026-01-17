export interface Expense {
  id: string
  amount: number
  category: string
  note?: string
  date: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export interface Budget {
  id: string
  category: string | null
  amount: number
  period: "monthly" | "weekly"
}

export interface Settings {
  currency: string
  currencySymbol: string
  theme: "light" | "dark" | "system"
  dailyReminder: boolean
  budgetAlerts: boolean
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Food", icon: "🍔", color: "hsl(24, 100%, 50%)" },
  { id: "2", name: "Transport", icon: "🚕", color: "hsl(210, 100%, 50%)" },
  { id: "3", name: "Shopping", icon: "🛍", color: "hsl(330, 100%, 50%)" },
  { id: "4", name: "Bills", icon: "💡", color: "hsl(45, 100%, 50%)" },
  { id: "5", name: "Entertainment", icon: "🎮", color: "hsl(270, 100%, 50%)" },
  { id: "6", name: "Health", icon: "🏥", color: "hsl(150, 100%, 40%)" },
  { id: "7", name: "Other", icon: "📦", color: "hsl(0, 0%, 50%)" },
]

export const DEFAULT_SETTINGS: Settings = {
  currency: "INR",
  currencySymbol: "₹",
  theme: "dark",
  dailyReminder: true,
  budgetAlerts: true,
}
