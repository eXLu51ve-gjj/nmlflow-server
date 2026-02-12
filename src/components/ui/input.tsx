import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-slate-400 selection:bg-indigo-500 selection:text-white bg-slate-900/60 border-transparent h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base text-white transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm hover:bg-slate-800/80",
        "focus-visible:border-indigo-500/30 focus-visible:ring-indigo-500/30 focus-visible:ring-2",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className
      )}
      style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
      {...props}
    />
  )
}

export { Input }
