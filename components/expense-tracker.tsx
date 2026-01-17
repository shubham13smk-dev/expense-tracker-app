"use client"

import { useState, useEffect, useCallback } from "react"
import { Home, PieChart, Wallet, Settings, Plus } from "lucide-react"
import { Dashboard } from "./dashboard"
import { Analytics } from "./analytics"
import { BudgetManager } from "./budget-manager"
import { SettingsPanel } from "./settings-panel"
import { AddExpenseDialog } from "./add-expense-dialog"
import { CategoryManager } from "./category-manager"
import { type Expense, type Category, type Budget, type Settings as SettingsType, DEFAULT_SETTINGS } from "@/lib/types"
import * as store from "@/lib/expense-store"
import { cn } from "@/lib/utils"

type Tab = "home" | "analytics" | "budget" | "settings"

export function ExpenseTracker() {
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setExpenses(store.getExpenses())
    setCategories(store.getCategories())
    setBudgets(store.getBudgets())
    setSettings(store.getSettings())
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark")
    } else if (settings.theme === "light") {
      document.documentElement.classList.remove("dark")
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (prefersDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [settings.theme])

  const refreshData = useCallback(() => {
    setExpenses(store.getExpenses())
    setCategories(store.getCategories())
    setBudgets(store.getBudgets())
    setSettings(store.getSettings())
  }, [])

  const handleAddExpense = (expense: Omit<Expense, "id" | "createdAt">) => {
    store.addExpense(expense)
    refreshData()
    setShowAddExpense(false)
  }

  const handleUpdateExpense = (id: string, updates: Partial<Expense>) => {
    store.updateExpense(id, updates)
    refreshData()
    setEditingExpense(null)
  }

  const handleDeleteExpense = (id: string) => {
    store.deleteExpense(id)
    refreshData()
  }

  const handleQuickAdd = (amount: number) => {
    store.addExpense({
      amount,
      category: "Other",
      date: new Date().toISOString().split("T")[0],
    })
    refreshData()
  }

  const handleUpdateSettings = (updates: Partial<SettingsType>) => {
    store.updateSettings(updates)
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  const handleSetBudget = (budget: Omit<Budget, "id">) => {
    store.setBudget(budget)
    refreshData()
  }

  const handleDeleteBudget = (id: string) => {
    store.deleteBudget(id)
    refreshData()
  }

  const tabs = [
    { id: "home" as const, icon: Home, label: "Home" },
    { id: "analytics" as const, icon: PieChart, label: "Analytics" },
    { id: "budget" as const, icon: Wallet, label: "Budget" },
    { id: "settings" as const, icon: Settings, label: "Settings" },
  ]

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 overflow-auto pb-20">
        {activeTab === "home" && (
          <Dashboard
            expenses={expenses}
            categories={categories}
            budgets={budgets}
            settings={settings}
            onQuickAdd={handleQuickAdd}
            onEditExpense={setEditingExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}
        {activeTab === "analytics" && (
          <Analytics expenses={expenses} categories={categories} budgets={budgets} settings={settings} />
        )}
        {activeTab === "budget" && (
          <BudgetManager
            budgets={budgets}
            categories={categories}
            expenses={expenses}
            settings={settings}
            onSetBudget={handleSetBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        )}
        {activeTab === "settings" && (
          <SettingsPanel
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onManageCategories={() => setShowCategoryManager(true)}
            onClearData={() => {
              store.clearAllData()
              refreshData()
            }}
            onExportData={() => {
              const data = store.exportData()
              const blob = new Blob([data], { type: "application/json" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `expense-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
            onImportData={(data) => {
              if (store.importData(data)) {
                refreshData()
                return true
              }
              return false
            }}
          />
        )}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddExpense(true)}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Add expense"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors",
                activeTab === id ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={label}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={showAddExpense || editingExpense !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddExpense(false)
            setEditingExpense(null)
          }
        }}
        categories={categories}
        settings={settings}
        expense={editingExpense}
        onSave={editingExpense ? (data) => handleUpdateExpense(editingExpense.id, data) : handleAddExpense}
      />

      {/* Category Manager Dialog */}
      <CategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
        categories={categories}
        onAddCategory={(cat) => {
          store.addCategory(cat)
          refreshData()
        }}
        onUpdateCategory={(id, updates) => {
          store.updateCategory(id, updates)
          refreshData()
        }}
        onDeleteCategory={(id) => {
          store.deleteCategory(id)
          refreshData()
        }}
      />
    </div>
  )
}
