/**
 * Clamp a number to [0, 100].
 */
export const clampPercent = (n) => Math.min(100, Math.max(0, n));
