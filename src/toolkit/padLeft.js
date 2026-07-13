/**
 * Left-pad a value to len.
 */
export const padLeft = (s, len, ch = '0') => String(s).padStart(len, ch);
