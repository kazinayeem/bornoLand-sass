import type { ThemeColors } from "./colors";

export function createShadows(colors: ThemeColors, dark: boolean) {
  const productShadow = {
    shadowColor: colors.shadow,
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 10,
  };

  return {
    product: productShadow,
    navigation: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -1 },
      shadowOpacity: dark ? 0.4 : 0.08,
      shadowRadius: 4,
      elevation: 8,
    },
    modal: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.32,
      shadowRadius: 40,
      elevation: 16,
    },
    frosted: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  } as const;
}
