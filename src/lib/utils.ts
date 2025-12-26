import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateReadingTime(htmlContent: string) {
  // Strip HTML tags to get plain text
  const text = htmlContent.replace(/<[^>]+>/g, '');
  // Split by whitespace and filter out empty strings
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  // Average reading speed is around 200-250 words per minute. We'll use 200.
  const readingTime = Math.ceil(wordCount / 200);

  return readingTime;
}
