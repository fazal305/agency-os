"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingField({ name, label, defaultValue = 0 }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => setValue(n)}
              className="sr-only"
              aria-label={`${n} out of 5`}
            />
            <Star
              className={cn(
                "size-6",
                n <= value ? "fill-warning-foreground text-warning-foreground" : "text-muted-foreground"
              )}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
