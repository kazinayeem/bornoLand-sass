import { useCallback, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, useTheme } from "../theme";
import { getInvoicePdfUrl } from "../features/invoices/invoice-api";

export function InvoicePreview({
  visible,
  invoiceId,
  invoiceNumber,
  onClose,
}: {
  visible: boolean;
  invoiceId: string;
  invoiceNumber?: string;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const pdfUrl = getInvoicePdfUrl(invoiceId);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.navigation, borderBottomColor: theme.colors.divider }]}>
          <Pressable onPress={onClose} hitSlop={8} style={styles.backBtn}>
            <Ionicons name="close-outline" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {invoiceNumber || "Invoice"}
          </Text>
          <View style={{ width: 44 }} />
        </View>
        {loading && (
          <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="document-text-outline" size={40} color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
              Loading PDF…
            </Text>
          </View>
        )}
        <WebView
          source={{ uri: pdfUrl }}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          onLoad={() => setLoading(false)}
          allowsBackForwardNavigationGestures
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    zIndex: 10,
  },
  loadingText: {
    fontSize: 14,
  },
});
