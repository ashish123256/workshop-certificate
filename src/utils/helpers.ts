import { Workshop } from '../types/types';

/**
 * Generates a random string for unique workshop links
 * @param length - Length of the random string (default: 16)
 * @returns Random alphanumeric string
 */
export const generateRandomString = (length = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Formats a date string to a readable format
 * @param dateString - Date string to format
 * @returns Formatted date string (e.g., "January 1, 2023")
 */
export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Formats workshop data for display
 * @param workshop - Workshop object
 * @returns Formatted workshop data
 */
export const formatWorkshopData = (workshop: Workshop) => {
  return {
    ...workshop,
    formattedDate: formatDate(workshop.date),
    fullDateTime: `${formatDate(workshop.date)} at ${workshop.time}`,
    status: workshop.isActive ? 'Active' : 'Inactive',
    statusColor: workshop.isActive ? 'green' : 'red'
  };
};

/**
 * Copies text to clipboard and returns success status
 * @param text - Text to copy
 * @returns Promise that resolves to boolean indicating success
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

/**
 * Generates a feedback link for a workshop
 * @param workshopId - Workshop ID
 * @param uniqueLink - Workshop's unique link
 * @returns Full feedback URL
 */
export const generateFeedbackLink = (workshopId: string, uniqueLink: string): string => {
  return `${window.location.origin}/feedback/${workshopId}/${uniqueLink}`;
};