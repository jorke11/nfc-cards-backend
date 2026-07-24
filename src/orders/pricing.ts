export type CardShape = 'card' | 'square' | 'circle' | 'triangle' | 'custom';

// Placeholder pricing (USD) — adjust before going live.
export const SHAPE_PRICES: Record<CardShape, number> = {
  card: 10,
  square: 15,
  circle: 15,
  triangle: 15,
  custom: 20,
};

export function getPriceForShape(shape: string): number | undefined {
  return SHAPE_PRICES[shape as CardShape];
}
