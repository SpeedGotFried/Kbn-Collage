import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines Tailwind + conditional classNames safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}