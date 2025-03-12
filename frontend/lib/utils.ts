import { type ClassValue, clsx } from "clsx"
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

/**
 * Formats a date string into a localized format
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Date invalide';
  }
  
  // Format date as DD/MM/YYYY
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Safely extracts an ID value from either a number or an object with an id property
 * @param value The value to extract an ID from (either a number or an object)
 * @returns The ID as a number, or null if not found
 */
export function getIdSafely(value: any): number | null {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'id' in value) return value.id;
  return null;
}
