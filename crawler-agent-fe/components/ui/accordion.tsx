"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface AccordionContextValue {
  value: string | undefined
  onValueChange: (value: string | undefined) => void
  type: "single" | "multiple"
  collapsible?: boolean
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(
  undefined
)

interface AccordionProps {
  type?: "single" | "multiple"
  collapsible?: boolean
  value?: string
  onValueChange?: (value: string | undefined) => void
  defaultValue?: string
  children: React.ReactNode
  className?: string
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = "single", collapsible = false, value: controlledValue, onValueChange, defaultValue, children, className }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue)
    const value = controlledValue !== undefined ? controlledValue : internalValue

    const handleValueChange = React.useCallback(
      (newValue: string | undefined) => {
        if (type === "single") {
          const nextValue = collapsible && value === newValue ? undefined : newValue
          if (onValueChange) {
            onValueChange(nextValue)
          } else {
            setInternalValue(nextValue)
          }
        }
      },
      [type, collapsible, value, onValueChange]
    )

    return (
      <AccordionContext.Provider value={{ value, onValueChange: handleValueChange, type, collapsible }}>
        <div ref={ref} className={cn("w-full", className)}>
          {children}
        </div>
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = "Accordion"

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const AccordionItemContext = React.createContext<{ value: string } | undefined>(undefined)

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, children, ...props }, ref) => {
    return (
      <AccordionItemContext.Provider value={{ value }}>
        <div
          ref={ref}
          className={cn("border-b", className)}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(AccordionContext)
    const itemContext = React.useContext(AccordionItemContext)
    if (!context) throw new Error("AccordionTrigger must be used within Accordion")
    if (!itemContext) throw new Error("AccordionTrigger must be used within AccordionItem")

    const isOpen = context.value === itemContext.value

    const handleClick = () => {
      context.onValueChange(itemContext.value)
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(AccordionContext)
    const itemContext = React.useContext(AccordionItemContext)
    if (!context) throw new Error("AccordionContent must be used within Accordion")
    if (!itemContext) throw new Error("AccordionContent must be used within AccordionItem")

    const isOpen = context.value === itemContext.value

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden text-sm transition-all",
          isOpen ? "animate-accordion-down" : "animate-accordion-up",
          !isOpen && "hidden"
        )}
        {...props}
      >
        <div className={cn("pb-4 pt-0", className)}>{children}</div>
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }