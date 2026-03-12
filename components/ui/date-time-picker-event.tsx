"use client"

import * as React from "react"
import { sv } from "react-day-picker/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

const TIME_SLOTS = Array.from({ length: 37 }, (_, i) => {
  const totalMinutes = i * 15
  const hour = Math.floor(totalMinutes / 60) + 9
  const minute = totalMinutes % 60
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
})

type DateTimePickerEventProps = {
  startAt: string
  endAt: string
  onStartChange: (iso: string) => void
  onEndChange: (iso: string) => void
  className?: string
}

/** Picks date (calendar) and start/end time (preset buttons) for an event. */
export function DateTimePickerEvent({
  startAt,
  endAt,
  onStartChange,
  onEndChange,
  className,
}: DateTimePickerEventProps) {
  const date = startAt ? new Date(startAt) : new Date()
  const startDate = startAt ? new Date(startAt) : null
  const endDate = endAt ? new Date(endAt) : null
  const startTime = startDate
    ? `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`
    : "09:00"
  const endTime = endDate
    ? `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`
    : "10:00"

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const dateStr = `${y}-${m}-${d}`

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return
    // Använd lokalt datum (getFullYear/getMonth/getDate), inte toISOString() som ger UTC och blir föregående dag i Sverige
    const y = selectedDate.getFullYear()
    const mo = String(selectedDate.getMonth() + 1).padStart(2, "0")
    const day = String(selectedDate.getDate()).padStart(2, "0")
    const dateStrLocal = `${y}-${mo}-${day}`
    onStartChange(`${dateStrLocal}T${startTime}:00`)
    onEndChange(`${dateStrLocal}T${endTime}:00`)
  }

  const handleStartTime = (time: string) => {
    onStartChange(`${dateStr}T${time}:00`)
  }

  const handleEndTime = (time: string) => {
    onEndChange(`${dateStr}T${time}:00`)
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      <div className="p-3">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          defaultMonth={date}
          showOutsideDays={false}
          locale={sv}
          className="mx-auto w-fit bg-transparent p-0"
          formatters={{
            formatWeekdayName: (d) =>
              d.toLocaleString("sv-SE", { weekday: "short" }),
            formatCaption: (d) =>
              d.toLocaleString("sv-SE", { month: "long", year: "numeric" }),
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 border-t border-border p-3">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Start</p>
          <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-muted/30 p-1">
            {TIME_SLOTS.map((time) => (
              <Button
                key={`start-${time}`}
                variant={startTime === time ? "default" : "ghost"}
                size="sm"
                className="mb-0.5 w-full justify-center text-xs shadow-none last:mb-0"
                onClick={() => handleStartTime(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Slut</p>
          <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-muted/30 p-1">
            {TIME_SLOTS.map((time) => (
              <Button
                key={`end-${time}`}
                variant={endTime === time ? "default" : "ghost"}
                size="sm"
                className="mb-0.5 w-full justify-center text-xs shadow-none last:mb-0"
                onClick={() => handleEndTime(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
