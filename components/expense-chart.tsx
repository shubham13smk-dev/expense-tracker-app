"use client"

import { useMemo } from "react"
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import type { Settings } from "@/lib/types"

interface ExpenseChartProps {
  data: { day: number; amount: number }[]
  settings: Settings
}

export function ExpenseChart({ data, settings }: ExpenseChartProps) {
  const chartData = useMemo(() => {
    const amounts = data.map((d) => d.amount).filter((a) => a > 0)
    const average = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0

    return data.map((d) => ({
      ...d,
      average,
    }))
  }, [data])

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${settings.currencySymbol}${(value / 1000).toFixed(1)}k`
    }
    return `${settings.currencySymbol}${value}`
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatValue}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "var(--foreground)" }}
            formatter={(value: number) => [formatValue(value), ""]}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Spent" />
          <Line type="monotone" dataKey="average" stroke="var(--chart-2)" strokeWidth={2} dot={false} name="Average" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
