"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type FieldProps = React.ComponentProps<"input"> & {
  label: string
  icon?: LucideIcon
}

/**
 * Floating-label input with micro-interactions:
 *  - label rests inside the field, floats up onto the border on focus/fill
 *  - leading icon tints to the brand colour while focused
 *  - password fields get a show/hide toggle
 */
export function Field({ id, label, type = "text", icon: Icon, className, ...props }: FieldProps) {
  const [show, setShow] = React.useState(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (show ? "text" : "password") : type

  return (
    <div className="group relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
      )}

      <input
        id={id}
        type={inputType}
        placeholder=" "
        className={cn(
          "peer h-12 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-transparent",
          "focus:border-primary focus:ring-4 focus:ring-primary/15",
          "hover:border-muted-foreground/40 focus:hover:border-primary",
          Icon && "pl-10",
          isPassword && "pr-11",
          className
        )}
        {...props}
      />

      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm text-muted-foreground transition-all duration-200",
          Icon ? "left-10" : "left-3.5",
          // floated state (on focus OR when the field has a value)
          "peer-focus:top-0 peer-focus:left-3 peer-focus:bg-background peer-focus:px-1 peer-focus:text-xs peer-focus:font-medium peer-focus:text-primary",
          "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs"
        )}
      >
        {label}
      </label>

      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  )
}
