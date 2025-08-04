import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-primary dark:focus:border-primary",
            !date && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            onDateChange?.(date)
            setOpen(false) // Auto-close when date is selected
          }}
          initialFocus
          className="border-gray-200 dark:border-gray-700"
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateTimePickerProps extends DatePickerProps {
  time?: string
  onTimeChange?: (time: string) => void
  timePlaceholder?: string
}

export function DateTimePicker({
  date,
  onDateChange,
  time,
  onTimeChange,
  placeholder = "Pick a date",
  timePlaceholder = "Select time",
  disabled = false,
  className,
}: DateTimePickerProps) {
  return (
    <div className="flex gap-2">
      <DatePicker
        date={date}
        onDateChange={onDateChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("flex-1", className)}
      />
      <div className="flex-1">
        <input
          type="time"
          value={time || ""}
          onChange={(e) => onTimeChange?.(e.target.value)}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          placeholder={timePlaceholder}
        />
      </div>
    </div>
  )
} 