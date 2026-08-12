/**
 * Formatting utilities for patient UI, doctor names, and dates
 */

/**
 * Ensures that a doctor's name is prefixed with "Dr." for clear identification.
 * e.g., "Rajesh Verma" -> "Dr. Rajesh Verma"
 * e.g., "Dr. Rajesh Verma" -> "Dr. Rajesh Verma"
 */
export function formatDoctorName(name?: string | null): string {
  if (!name) return 'Dr. Specialist';
  const trimmed = name.trim();
  if (/^dr\.?\s+/i.test(trimmed)) {
    return trimmed;
  }
  return `Dr. ${trimmed}`;
}
