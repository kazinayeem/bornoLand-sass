import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { layout, motion, radius, spacing, useTheme, useThemedStyles, type AppTheme } from "../theme";

type IoniconsName = keyof typeof Ionicons.glyphMap;

export const glyphs: Record<string, IoniconsName> = {
  dashboard: "grid-outline",
  stores: "storefront-outline",
  products: "cube-outline",
  orders: "bag-handle-outline",
  customers: "people-outline",
  categories: "list-outline",
  inventory: "server-outline",
  coupons: "ticket-outline",
  cms: "document-text-outline",
  pages: "copy-outline",
  media: "images-outline",
  builder: "construct-outline",
  theme: "color-palette-outline",
  analytics: "stats-chart-outline",
  marketing: "megaphone-outline",
  apps: "apps-outline",
  reports: "document-text-outline",
  branding: "color-fill-outline",
  domain: "globe-outline",
  seo: "search-outline",
  settings: "settings-outline",
  activity: "pulse-outline",
  billing: "card-outline",
  notifications: "notifications-outline",
  profile: "person-circle-outline",
  help: "help-circle-outline",
  more: "ellipsis-horizontal-outline",
  back: "chevron-back-outline",
  add: "add-outline",
  search: "search-outline",
  chevron: "chevron-forward-outline",
  store: "storefront-outline",
  home: "home-outline",
  close: "close-outline",
  checkmark: "checkmark-outline",
  trash: "trash-outline",
  duplicate: "copy-outline",
  eye: "eye-outline",
  eyeOff: "eye-off-outline",
  move: "menu-outline",
  addCircle: "add-circle-outline",
  refresh: "refresh-outline",
  lockClosed: "lock-closed-outline",
  lockOpen: "lock-open-outline",
  download: "download-outline",
  upload: "cloud-upload-outline",
  link: "link-outline",
  share: "share-outline",
  star: "star-outline",
  time: "time-outline",
  warning: "warning-outline",
  information: "information-circle-outline",
};

export function Icon({
  name,
  size = 20,
  color,
}: {
  name: keyof typeof glyphs;
  size?: number;
  color?: string;
}) {
  const { theme } = useTheme();
  return (
    <Ionicons
      name={glyphs[name]}
      size={size}
      color={color ?? theme.colors.icon}
      accessibilityElementsHidden
    />
  );
}

export function AppButton({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
  compact,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const scale = useRef(new Animated.Value(1)).current;
  const isPrimary = variant === "primary" || variant === "danger";
  const isDanger = variant === "danger";
  const palette = isPrimary
    ? { backgroundColor: isDanger ? theme.colors.danger : theme.colors.primary }
    : variant === "secondary"
      ? { backgroundColor: "transparent", borderWidth: 1, borderColor: theme.colors.primary }
      : { backgroundColor: "transparent" };
  const textStyle = isPrimary
    ? { color: theme.colors.textInverse, ...typographyProps.buttonUtility }
    : variant === "secondary"
      ? { color: theme.colors.primary, ...typographyProps.buttonUtility }
      : { color: theme.colors.primary, ...typographyProps.buttonUtility };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}
      disabled={disabled || loading}
      onPressIn={() => { Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start(); }}
      onPressOut={() => { Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start(); }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compactButton,
        palette,
        pressed && !disabled && styles.pressed,
        (disabled || loading) && styles.disabled,
        isPrimary && styles.primaryButton,
        style,
      ]}
    >
      <Animated.View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, transform: [{ scale }] }}>
        {loading ? (
          <ActivityIndicator color={isPrimary ? theme.colors.textInverse : theme.colors.primary} />
        ) : (
          <>
            {icon}
            <Text style={[styles.buttonText, textStyle, variant === "ghost" && { color: theme.colors.primary }]}>
              {title}
            </Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

export function Field({
  label,
  error,
  keyboardType,
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={props.accessibilityLabel ?? label}
        accessibilityHint={error || props.accessibilityHint}
        placeholderTextColor={theme.colors.placeholder}
        keyboardAppearance={theme.dark ? "dark" : "light"}
        keyboardType={keyboardType}
        {...props}
        style={[styles.input, error && styles.inputError, props.multiline && styles.multiline, props.style]}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useThemedStyles(createStyles);
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "primary";
}) {
  const styles = useThemedStyles(createStyles);
  const toneStyle =
    tone === "success" ? styles.badgeSuccess
    : tone === "warning" ? styles.badgeWarning
    : tone === "danger" ? styles.badgeDanger
    : tone === "primary" ? styles.badgePrimary
    : styles.badgeNeutral;
  const textStyle =
    tone === "success" ? styles.badgeSuccessText
    : tone === "warning" ? styles.badgeWarningText
    : tone === "danger" ? styles.badgeDangerText
    : tone === "primary" ? styles.badgePrimaryText
    : styles.badgeNeutralText;
  return (
    <View style={[styles.badge, toneStyle]}>
      <Text numberOfLines={1} style={[styles.badgeText, textStyle]}>
        {label}
      </Text>
    </View>
  );
}

export function Screen({
  children,
  refreshing,
  onRefresh,
  contentStyle,
  noScroll = false,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  noScroll?: boolean;
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  if (noScroll)
    return <View style={[styles.screenContent, { flex: 1 }, contentStyle]}>{children}</View>;
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={styles.screen}
      contentContainerStyle={[styles.screenContent, contentStyle]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={Boolean(refreshing)}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.sectionHeader}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {action && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${action}, ${title}`}
          onPress={onAction}
          style={styles.sectionActionTarget}
        >
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({
  icon = "cube-outline",
  title,
  message,
  action,
  onAction,
}: {
  icon?: string;
  title: string;
  message: string;
  action?: string;
  onAction?: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon as IoniconsName} size={28} color="#fff" />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {action && onAction ? <AppButton compact title={action} onPress={onAction} /> : null}
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="assertive">
      <Card style={styles.errorCard}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          <Ionicons name="warning-outline" size={20} color={theme.colors.danger} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
        </View>
        <Text style={styles.errorMessage}>{message}</Text>
        {onRetry ? (
          <AppButton compact variant="secondary" title="Try again" onPress={onRetry} />
        ) : null}
      </Card>
    </View>
  );
}

export function Skeleton({
  width = "100%",
  height = 18,
  radiusValue = 8,
}: {
  width?: number | `${number}%`;
  height?: number;
  radiusValue?: number;
}) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0.6)).current;
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => mounted && setReduceMotion(value));
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(0.7);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: motion.skeleton,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: motion.skeleton,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion]);
  return (
    <Animated.View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{
        width,
        height,
        opacity,
        borderRadius: radiusValue,
        backgroundColor: theme.colors.skeleton,
      }}
    />
  );
}

export function SearchBox({
  value,
  onChangeText,
  placeholder = "Search…",
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.searchBox}>
      <Ionicons name="search-outline" size={18} color={theme.colors.iconMuted} />
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        keyboardAppearance={theme.dark ? "dark" : "light"}
        style={styles.searchInput}
        autoCapitalize="none"
        returnKeyType="search"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Clear search"
        disabled={!value}
        onPress={() => onChangeText("")}
        style={styles.clearTarget}
      >
        {value ? (
          <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
        ) : null}
      </Pressable>
    </View>
  );
}

export function Divider() {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.divider} />;
}

const typographyProps = {
  buttonUtility: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 18,
    letterSpacing: -0.224,
  },
  body: {
    fontSize: 17,
    fontWeight: "400" as const,
    lineHeight: 25,
    letterSpacing: -0.374,
  },
  caption: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
    letterSpacing: -0.224,
  },
};

const createStyles = (theme: AppTheme) => {
  const colors = theme.colors;
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    screenContent: {
      width: "100%",
      maxWidth: layout.contentWideMaxWidth,
      alignSelf: "center",
      padding: spacing.lg,
      gap: spacing.xl,
      paddingBottom: 112,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.lg,
      ...theme.shadows.product,
    },
    button: {
      minHeight: 50,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.xl,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      overflow: "hidden",
    },
    primaryButton: { minHeight: 50 },
    compactButton: { minHeight: layout.minTouchTarget, paddingHorizontal: spacing.lg },
    buttonText: { ...typographyProps.buttonUtility },
    pressed: { opacity: 0.92 },
    disabled: { opacity: 0.5 },
    fieldWrap: { gap: 7 },
    label: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      letterSpacing: -0.224,
    },
    input: {
      minHeight: 50,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      backgroundColor: colors.input,
      color: colors.text,
      paddingHorizontal: 20,
      fontSize: 17,
      lineHeight: 25,
      letterSpacing: -0.374,
    },
    inputError: { borderColor: colors.danger, backgroundColor: colors.inputError },
    multiline: {
      minHeight: 100,
      paddingTop: 14,
      textAlignVertical: "top",
      borderRadius: radius.lg,
    },
    errorText: { color: colors.danger, fontSize: 12 },
    badge: {
      alignSelf: "flex-start",
      borderRadius: radius.pill,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    badgeText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
    badgeNeutral: { backgroundColor: colors.control },
    badgeNeutralText: { color: colors.textMuted },
    badgeSuccess: { backgroundColor: colors.successSoft },
    badgeSuccessText: { color: colors.success },
    badgeWarning: { backgroundColor: colors.warningSoft },
    badgeWarningText: { color: colors.warning },
    badgeDanger: { backgroundColor: colors.dangerSoft },
    badgeDangerText: { color: colors.danger },
    badgePrimary: { backgroundColor: colors.primarySoft },
    badgePrimaryText: { color: colors.primary },
    sectionHeader: {
      minHeight: layout.minTouchTarget,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 2,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 21,
      fontWeight: "600",
      letterSpacing: 0.231,
    },
    sectionActionTarget: {
      minHeight: layout.minTouchTarget,
      justifyContent: "center",
      paddingLeft: 14,
    },
    sectionAction: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "500",
      letterSpacing: -0.2,
    },
    empty: {
      alignItems: "center",
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.section,
      gap: spacing.sm,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
      ...theme.shadows.frosted,
    },
    emptyTitle: {
      fontSize: 21,
      fontWeight: "600",
      color: colors.text,
      letterSpacing: 0.231,
    },
    emptyMessage: {
      maxWidth: 300,
      textAlign: "center",
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 10,
    },
    errorCard: {
      backgroundColor: colors.dangerSoft,
      borderColor: colors.dangerBorder,
      gap: spacing.sm,
    },
    errorTitle: {
      color: colors.danger,
      fontSize: 17,
      fontWeight: "600",
      letterSpacing: -0.374,
    },
    errorMessage: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
    searchBox: {
      minHeight: 46,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      paddingLeft: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.input,
    },
    searchInput: {
      flex: 1,
      fontSize: 17,
      color: colors.text,
      paddingVertical: 10,
      letterSpacing: -0.374,
    },
    clearTarget: {
      width: layout.minTouchTarget,
      height: layout.minTouchTarget,
      alignItems: "center",
      justifyContent: "center",
    },
    divider: { height: 1, backgroundColor: colors.divider },
  });
};
