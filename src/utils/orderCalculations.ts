/**
 * Utility functions for order calculations
 */

export interface OrderCalculationResult {
  subtotal: number;
  loyaltyDiscount: number;
  finalAmount: number;
  totalAfterLoyalty: number;
}

/**
 * Calculate order totals with loyalty discount applied
 */
export const calculateOrderTotals = (
  subtotal: number,
  customPoints: number = 0,
  deliveryFee: number = 0
): OrderCalculationResult => {
  const loyaltyDiscount = customPoints; // 1 point = ₹1
  const totalAfterLoyalty = subtotal - loyaltyDiscount;
  const finalAmount = totalAfterLoyalty + deliveryFee;

  return {
    subtotal,
    loyaltyDiscount,
    finalAmount,
    totalAfterLoyalty
  };
};

/**
 * Validate loyalty points usage
 */
export const validateLoyaltyPointsUsage = (
  customPoints: number,
  availablePoints: number,
  subtotal: number,
  rewardPointsUsed: number = 0
): { isValid: boolean; error?: string } => {
  if (customPoints < 0) {
    return { isValid: false, error: 'Points cannot be negative' };
  }

  if (customPoints + rewardPointsUsed > availablePoints) {
    return { isValid: false, error: 'Insufficient loyalty points' };
  }

  const maxAllowedDiscount = Math.floor(subtotal * 0.3); // 30% of order
  if (customPoints > maxAllowedDiscount) {
    return { isValid: false, error: `Maximum discount allowed is ₹${maxAllowedDiscount}` };
  }

  return { isValid: true };
};