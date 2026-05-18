import { Transform } from 'class-transformer';

/**
 * Sanitize string input
 * - Trim whitespace
 * - Remove HTML tags
 * - Escape special characters
 */
export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    return value
      .trim() // Hapus leading/trailing whitespace
      .replace(/<[^>]*>/g, '') // Hapus HTML tags
      .replace(/[^\w\s\-.,!?']/g, ''); // Hapus special characters kecuali yang aman
  });
}

/**
 * Lowercase string input
 */
export function Lowercase() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    return value.toLowerCase();
  });
}

/**
 * Trim whitespace
 */
export function Trim() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    return value.trim();
  });
}