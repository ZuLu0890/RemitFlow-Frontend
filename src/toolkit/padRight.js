/**
 * Right-pad a value to len.
 */
export const padRight = (s, len, ch = ' ') => String(s).padEnd(len, ch);
