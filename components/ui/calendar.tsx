"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames: userClassNames,
  showOutsideDays = true,
  components: userComponents,
  ...props
}: CalendarProps) {
  const defaults = getDefaultClassNames()
  const customClassNames = {
    months: "relative flex flex-col sm:flex-row gap-4",
    month: "w-full",
    month_caption: "relative mb-1 flex h-9 items-center justify-center px-10",
    caption_label: "text-sm font-medium",
    nav: "absolute left-0 right-0 top-0 flex justify-between px-0",
    button_previous: cn(
      buttonVariants({ variant: "ghost" }),
      "size-9 text-muted-foreground/80 hover:text-foreground p-0 shrink-0",
    ),
    button_next: cn(
      buttonVariants({ variant: "ghost" }),
      "size-9 text-muted-foreground/80 hover:text-foreground p-0 shrink-0",
    ),
    weekday: "size-9 p-0 text-xs font-medium text-muted-foreground/80",
    month_grid: "relative z-0",
    weeks: "relative z-0",
    day: "group relative size-9 px-0 text-sm z-0",
    day_button:
      "relative z-10 flex size-9 cursor-pointer touch-manipulation select-none items-center justify-center whitespace-nowrap rounded-lg p-0 text-foreground outline-offset-2 focus:outline-none focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 hover:bg-accent hover:text-accent-foreground data-[disabled]:cursor-not-allowed data-[disabled]:text-muted-foreground/30 data-[outside]:text-muted-foreground/30",
    today: "bg-accent/50",
    outside: "text-muted-foreground/30",
    hidden: "invisible",
    week_number: "size-9 p-0 text-xs font-medium text-muted-foreground/80",
    // Vald dag – appliceras på dag-cell (td); biblioteket använder denna klass
    selected: "bg-primary text-primary-foreground rounded-lg [&_button]:bg-primary [&_button]:text-primary-foreground [&_button]:hover:bg-primary/90 [&_button]:hover:text-primary-foreground",
  }
  const mergedClassNames = { ...defaults, ...customClassNames, ...userClassNames }

  const defaultComponents = {
    Chevron: (chevronProps: { orientation?: "left" | "right" | "up" | "down" }) => {
      const o = chevronProps?.orientation
      if (o === "left" || o === "up") {
        return <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
      }
      return <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
    },
    // type="button" så att klick på en dag inte submitar formulär (default i form är submit)
    DayButton: (props: React.ButtonHTMLAttributes<HTMLButtonElement> & { day?: unknown; modifiers?: unknown }) => {
      // day + modifiers come from library; we only spread button props (type="button" prevents form submit)
      const { day, modifiers, ...buttonProps } = props
      void [day, modifiers]
      return <button type="button" {...buttonProps} />
    },
  }

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit", className)}
      classNames={mergedClassNames}
      components={mergedComponents}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
