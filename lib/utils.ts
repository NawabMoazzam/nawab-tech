import { clsx, type ClassValue } from "clsx";
import type { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Style objects that carry CSS custom properties, e.g.
 * `style={{ "--line": 1 } as CSSVars}`.
 */
export type CSSVars = CSSProperties & Record<`--${string}`, string | number>;
