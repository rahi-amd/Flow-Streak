export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  minTouchTarget: 44,
  recommendedTouchTarget: 60,
} as const;

export type Spacing = keyof typeof spacing;