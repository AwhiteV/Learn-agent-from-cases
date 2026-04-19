import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "border-input h-9 w-full min-w-0 rounded-md border bg-white px-3 py-1 text-sm shadow-xs outline-none transition focus-visible:ring-2 focus-visible:ring-slate-300 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
