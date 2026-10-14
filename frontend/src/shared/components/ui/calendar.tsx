import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"
import { DayPicker, type ChevronProps } from "react-day-picker"

import { cn } from "cn"

import "react-day-picker/style.css"

function Chevron({ className, orientation, size = 16 }: ChevronProps) {
  const Icon =
    orientation === "left"
      ? ChevronLeft
      : orientation === "right"
        ? ChevronRight
        : orientation === "up"
          ? ChevronUp
          : ChevronDown

  return (
    <Icon
      aria-hidden="true"
      className={cn("size-4", className)}
      size={size}
    />
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 text-sm", className)}
      classNames={classNames}
      style={
        {
          "--rdp-accent-color": "var(--color-primary)",
          "--rdp-accent-background-color": "var(--color-accent)",
          "--rdp-today-color": "var(--color-primary)",
          "--rdp-day-width": "36px",
          "--rdp-day-height": "36px",
          "--rdp-day_button-width": "34px",
          "--rdp-day_button-height": "34px",
          "--rdp-day_button-border-radius": "8px",
          "--rdp-nav_button-width": "2rem",
          "--rdp-nav_button-height": "2rem",
          "--rdp-outside-opacity": "0.5",
          "--rdp-disabled-opacity": "0.4",
          "--rdp-months-gap": "0.75rem",
        } as React.CSSProperties
      }
      components={{ Chevron }}
      {...props}
    />
  )
}

export { Calendar }