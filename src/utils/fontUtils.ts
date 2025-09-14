/**
 * Font utility functions for consistent typography across the application
 */

/**
 * System font stack specifically for numbers
 * This ensures consistent number rendering across all platforms
 */
export const SYSTEM_FONT_STACK = '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/**
 * CSS for applying the system font to numbers
 * Use this in styled-components where you need to ensure numbers use the system font
 */
export const numberFontCSS = `
  font-family: ${SYSTEM_FONT_STACK} !important;
  -webkit-font-feature-settings: "tnum";
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
`;

/**
 * Helper function to format numbers with the correct font styling
 * Returns a string with the number formatted
 */
export const formatNumberWithFont = (value: number | string): string => {
  return String(value);
};

// Note: If you need to use JSX, create a separate React component in a .tsx file
