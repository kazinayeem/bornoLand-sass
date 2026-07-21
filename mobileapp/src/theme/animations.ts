export const motion = {
  fast: 120,
  normal: 200,
  slow: 300,
  screen: 180,
  skeleton: 700,
} as const;

export const easings = {
  apple: [0.25, 0.46, 0.45, 0.94] as const,
  easeOut: [0.0, 0.0, 0.58, 1.0] as const,
  easeInOut: [0.42, 0.0, 0.58, 1.0] as const,
} as const;
