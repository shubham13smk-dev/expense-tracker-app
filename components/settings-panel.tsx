"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Settings } from "@/lib/types"
import { Moon, Sun, Monitor, Tag, Download, Upload, Trash2, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

interface SettingsPanelProps {
  settings: Settings
  onUpdateSettings: (updates: Partial<Settings>) => void
  onManageCategories: () => void
  onClearData: () => void
  onExportData: () => void
  onImportData: (data: string) => boolean
}

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
]

export function SettingsPanel({
  settings,
  onUpdateSettings,
  onManageCategories,
  onClearData,
  onExportData,
  onImportData,
}: SettingsPanelProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [importError, setImportError] = useState("")

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const data = event.target?.result as string
      if (onImportData(data)) {
        setImportError("")
      } else {
        setImportError("Invalid backup file")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const themeOptions = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ] as const

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold text-foreground">Settings</h1>

      {/* Appearance */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdateSettings({ theme: value })}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors",
                    settings.theme === value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Currency</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={settings.currency}
            onValueChange={(value) => {
              const currency = CURRENCIES.find((c) => c.code === value)
              if (currency) {
                onUpdateSettings({
                  currency: currency.code,
                  currencySymbol: currency.symbol,
                })
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="daily-reminder">Daily Reminder</Label>
              <p className="text-xs text-muted-foreground">Remind to log expenses</p>
            </div>
            <Switch
              id="daily-reminder"
              checked={settings.dailyReminder}
              onCheckedChange={(checked) => onUpdateSettings({ dailyReminder: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="budget-alerts">Budget Alerts</Label>
              <p className="text-xs text-muted-foreground">Warn when approaching limits</p>
            </div>
            <Switch
              id="budget-alerts"
              checked={settings.budgetAlerts}
              onCheckedChange={(checked) => onUpdateSettings({ budgetAlerts: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <button onClick={onManageCategories} className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Manage Categories</span>
            </div>
            <span className="text-muted-foreground">→</span>
          </button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={onExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data (JSON)
          </Button>

          <div>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => document.getElementById("import-file")?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Backup
            </Button>
            {importError && <p className="mt-1 text-sm text-destructive">{importError}</p>}
          </div>

          <Button variant="destructive" className="w-full justify-start" onClick={() => setShowClearConfirm(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">ExpenseTracker v1.0.0</p>
          <p className="text-xs text-muted-foreground">Your data is stored locally on this device</p>
        </CardContent>
      </Card>

      {/* Clear Data Confirmation */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your expenses, budgets, and settings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClearData()
                setShowClearConfirm(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
