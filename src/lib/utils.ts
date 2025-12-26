import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateReadingTime(htmlContent: string): number {
  if (!htmlContent) return 0;
  
  // Strip HTML tags to get plain text
  const text = htmlContent.replace(/<[^>]+>/g, '');
  // Split by whitespace and filter out empty strings
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  // Average reading speed is around 200 words per minute.
  const rawReadingTime = wordCount / 200;

  // Round to the nearest quarter minute
  return Math.round(rawReadingTime * 4) / 4;
}
