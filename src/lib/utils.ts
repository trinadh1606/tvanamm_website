import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Smart Indian currency formatting utility
export function formatIndianCurrency(amount: number): string {
  if (amount < 100000) {
    // Under 1 lakh - show actual amount
    return `₹${amount.toLocaleString('en-IN')}`;
  } else if (amount < 10000000) {
    // Under 1 crore - show in lakhs
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else {
    // Above 1 crore - show in crores
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
}
