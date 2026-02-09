/**
 * Format a single date
 * @param dateString - ISO date string
 * @param format - 'short' | 'long' | 'numeric'
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  format: 'short' | 'long' | 'numeric' = 'short',
): string {
  const date = new Date(dateString);

  switch (format) {
    case 'short':
      // e.g., "Sep 9, 2026"
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'long':
      // e.g., "September 9, 2026"
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    case 'numeric':
      // e.g., "09/09/2026"
      return date.toLocaleDateString('en-US');
    default:
      return date.toLocaleDateString('en-US');
  }
}

/**
 * Format a date range intelligently
 * @param start - Start date ISO string
 * @param end - End date ISO string
 * @returns Formatted date range (e.g., "Sep 9 - 13, 2026" or "Sep 9 - Oct 2, 2026")
 */
export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
  const startDay = startDate.getDate();
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
  const endDay = endDate.getDate();
  const year = endDate.getFullYear();

  // Same month: "Sep 9 - 13, 2026"
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  }

  // Different months: "Sep 9 - Oct 2, 2026"
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

/**
 * Get relative time (e.g., "2 days ago", "in 3 weeks")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
  if (diffDays > 0 && diffDays < 30)
    return `In ${Math.floor(diffDays / 7)} weeks`;
  if (diffDays < 0 && diffDays > -30)
    return `${Math.floor(Math.abs(diffDays) / 7)} weeks ago`;
  if (diffDays > 0) return `In ${Math.floor(diffDays / 30)} months`;
  return `${Math.floor(Math.abs(diffDays) / 30)} months ago`;
}

/**
 * Calculate duration between two dates
 * @param start - Start date ISO string
 * @param end - End date ISO string
 * @returns Duration string (e.g., "3 days", "2 weeks")
 */
export function getDuration(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Same day';
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  const months = Math.floor(diffDays / 30);
  return months === 1 ? '1 month' : `${months} months`;
}

/**
 * Check if a date is in the past
 * @param dateString - ISO date string
 * @returns true if date is in the past
 */
export function isPast(dateString: string): boolean {
  return new Date(dateString) < new Date();
}

/**
 * Check if a date is in the future
 * @param dateString - ISO date string
 * @returns true if date is in the future
 */
export function isFuture(dateString: string): boolean {
  return new Date(dateString) > new Date();
}
