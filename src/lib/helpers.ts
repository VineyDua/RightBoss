/**
 * Combine multiple class names
 */
export function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
} 