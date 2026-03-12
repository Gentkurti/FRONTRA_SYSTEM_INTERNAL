"use client"

import * as React from "react"
import { sv } from "react-day-picker/locale"

import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

type DatePickerDeadlineProps = {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  onClear?: () => void
  className?: string
}

/** Date picker for 2026 deadlines: calendar only, no time. */
export function DatePickerDeadline({
  value,
  onChange,
  onClear,
  className,
}: DatePickerDeadlineProps) {
  const fromDate = new Date(2026, 0, 1)
  const toDate = new Date(2026, 11, 31)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Calendar
        mode="single"
        selected={value}
        onSelect={onChange}
        defaultMonth={value ?? fromDate}
        fromDate={fromDate}
        toDate={toDate}
        locale={sv}
        showOutsideDays={false}
        className="rounded-lg border border-border bg-card p-3"
        formatters={{
          formatWeekdayName: (date) =>
            date.toLocaleString("sv-SE", { weekday: "short" }),
          formatCaption: (date) =>
            date.toLocaleString("sv-SE", { month: "long", year: "numeric" }),
        }}
      />
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Ingen deadline
        </button>
      )}
    </div>
  )
}
