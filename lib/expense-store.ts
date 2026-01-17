import { type Expense, type Category, type Budget, type Settings, DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from "./types"

const STORAGE_KEYS = {
  EXPENSES: "expense-tracker-expenses",
  CATEGORIES: "expense-tracker-categories",
  BUDGETS: "expense-tracker-budgets",
  SETTINGS: "expense-tracker-settings",
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

export function getExpenses(): Expense[] {
  return getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, [])
}

export function addExpense(expense: Omit<Expense, "id" | "createdAt">): Expense {
  const expenses = getExpenses()
  const newExpense: Expense = {
    ...expense,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  expenses.unshift(newExpense)
  setToStorage(STORAGE_KEYS.EXPENSES, expenses)
  return newExpense
}

export function updateExpense(id: string, updates: Partial<Expense>): Expense | null {
  const expenses = getExpenses()
  const index = expenses.findIndex((e) => e.id === id)
  if (index === -1) return null
  expenses[index] = { ...expenses[index], ...updates }
  setToStorage(STORAGE_KEYS.EXPENSES, expenses)
  return expenses[index]
}

export function deleteExpense(id: string): boolean {
  const expenses = getExpenses()
  const filtered = expenses.filter((e) => e.id !== id)
  if (filtered.length === expenses.length) return false
  setToStorage(STORAGE_KEYS.EXPENSES, filtered)
  return true
}

export function getCategories(): Category[] {
  return getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES)
}

export function addCategory(category: Omit<Category, "id">): Category {
  const categories = getCategories()
  const newCategory: Category = {
    ...category,
    id: crypto.randomUUID(),
  }
  categories.push(newCategory)
  setToStorage(STORAGE_KEYS.CATEGORIES, categories)
  return newCategory
}

export function updateCategory(id: string, updates: Partial<Category>): Category | null {
  const categories = getCategories()
  const index = categories.findIndex((c) => c.id === id)
  if (index === -1) return null
  categories[index] = { ...categories[index], ...updates }
  setToStorage(STORAGE_KEYS.CATEGORIES, categories)
  return categories[index]
}

export function deleteCategory(id: string): boolean {
  const categories = getCategories()
  const filtered = categories.filter((c) => c.id !== id)
  if (filtered.length === categories.length) return false
  setToStorage(STORAGE_KEYS.CATEGORIES, filtered)
  return true
}

export function getBudgets(): Budget[] {
  return getFromStorage<Budget[]>(STORAGE_KEYS.BUDGETS, [])
}

export function setBudget(budget: Omit<Budget, "id">): Budget {
  const budgets = getBudgets()
  const existingIndex = budgets.findIndex((b) => b.category === budget.category && b.period === budget.period)

  const newBudget: Budget = {
    ...budget,
    id: existingIndex >= 0 ? budgets[existingIndex].id : crypto.randomUUID(),
  }

  if (existingIndex >= 0) {
    budgets[existingIndex] = newBudget
  } else {
    budgets.push(newBudget)
  }

  setToStorage(STORAGE_KEYS.BUDGETS, budgets)
  return newBudget
}

export function deleteBudget(id: string): boolean {
  const budgets = getBudgets()
  const filtered = budgets.filter((b) => b.id !== id)
  if (filtered.length === budgets.length) return false
  setToStorage(STORAGE_KEYS.BUDGETS, filtered)
  return true
}

export function getSettings(): Settings {
  return getFromStorage<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
}

export function updateSettings(updates: Partial<Settings>): Settings {
  const settings = getSettings()
  const newSettings = { ...settings, ...updates }
  setToStorage(STORAGE_KEYS.SETTINGS, newSettings)
  return newSettings
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
}

export function exportData(): string {
  const data = {
    expenses: getExpenses(),
    categories: getCategories(),
    budgets: getBudgets(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  }
  return JSON.stringify(data, null, 2)
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString)
    if (data.expenses) setToStorage(STORAGE_KEYS.EXPENSES, data.expenses)
    if (data.categories) setToStorage(STORAGE_KEYS.CATEGORIES, data.categories)
    if (data.budgets) setToStorage(STORAGE_KEYS.BUDGETS, data.budgets)
    if (data.settings) setToStorage(STORAGE_KEYS.SETTINGS, data.settings)
    return true
  } catch {
    return false
  }
}
