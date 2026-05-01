/**
 * Formats a date string or Date object into Arabic locale format.
 */
export const formatArabicDate = (date: string | Date): string =>
    new Date(date).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
