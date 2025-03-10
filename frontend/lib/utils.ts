import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a value to a string suitable for use in URLs
 * @param value The value to convert to a string
 * @returns The string representation of the value
 */
export function toPathString(value: string | number): string {
  return String(value)
}
