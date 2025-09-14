import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 6);

export const generateUsername = (email: string): string => {
  // Get the part before @ in email
  const localPart = email.split('@')[0];
  
  // Remove special characters and spaces
  const cleanLocalPart = localPart.replace(/[^a-zA-Z0-9]/g, '');
  
  // Take first 10 characters (or less if shorter)
  const prefix = cleanLocalPart.slice(0, 10).toLowerCase();
  
  // Add random suffix
  return `${prefix}_${nanoid()}`;
};

export const generateDisplayName = (email: string): string => {
  const localPart = email.split('@')[0];
  // Capitalize first letter of each word and remove special characters
  return localPart
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
