import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Animated, Linking, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import { useApp } from "../context/AppContext";
import { radius, spacing, useTheme, type AppTheme } from "../theme";
import { AppButton, Badge, Card, ErrorState, Icon, Screen, Skeleton } from "../components/ui";
import { getInvoice, downloadInvoicePdf, sharePdf, getInvoicePdfUrl, getPublicInvoiceUrl } from "../features/invoices/invoice-api";
import type { Invoice, InvoiceStatus, TimelineEvent } from "../features/invoices/invoice-types";

const invoiceCache = new Map<string, Invoice>();
function cacheInvoice(id: string, data: Invoice) { invoiceCache.set(id, data); }
function getCachedInvoice(id: string): Invoice | undefined { return invoiceCache.get(id); }

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bgColor: string }> = {
  paid: { label: "Paid", color: "#14865a", bgColor: "#eaf9f2" },
  pending: { label: "Pending", color: "#b66a08", bgColor: "#fff6e5" },
  rejected: { label: "Failed", color: "#c93140", bgColor: "#fff0f1" },
  refunded: { label: "Refunded", color: "#7c3aed", bgColor: "#f1edff" },
};

function formatCurrency(amount: number, currency = "BDT"): string {
  return `${currency} ${amount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={detailStyles.row}>
      <Text style={[detailStyles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text
        style={[
          detailStyles.value,
          { color: theme.colors.text },
          mono && { fontVariant: ["tabular-nums"] as const },
        ]}
        selectable
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function InfoCard({ children, style }: { children: React.ReactNode; style?: any }) {
  const { theme } = useTheme();
  return (
    <View style={[detailStyles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]}>
      {children}
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  const { theme } = useTheme();
  return (
    <View style={detailStyles.sectionTitleRow}>
      <Text style={[detailStyles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      <View style={[detailStyles.sectionLine, { backgroundColor: theme.colors.divider }]} />
    </View>
  );
}

function TimelineItem({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={detailStyles.timelineRow}>
      <View style={detailStyles.timelineLine}>
        <View style={[detailStyles.timelineDot, { backgroundColor: theme.colors.primary }]} />
        {!isLast && <View style={[detailStyles.timelineConnector, { backgroundColor: theme.colors.divider }]} />}
      </View>
      <View style={detailStyles.timelineContent}>
        <Text style={[detailStyles.timelineEvent, { color: theme.colors.text }]}>
          {event.description || event.event.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Text>
        <Text style={[detailStyles.timelineDate, { color: theme.colors.textMuted }]}>
          {formatDateTime(event.date)}
        </Text>
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: keyof typeof import("../components/ui").glyphs;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        detailStyles.actionBtn,
        { backgroundColor: theme.colors.control },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons
        name={
          icon === "download" ? "download-outline" :
          icon === "share" ? "share-outline" :
          icon === "link" ? "link-outline" :
          icon === "eye" ? "eye-outline" :
          icon === "copy" ? "copy-outline" :
          icon === "checkmark" ? "checkmark-outline" :
          "ellipse-outline"
        }
        size={18}
        color={danger ? theme.colors.danger : theme.colors.primary}
      />
      <Text style={[detailStyles.actionLabel, { color: danger ? theme.colors.danger : theme.colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function InvoiceDetailScreen({ invoiceId }: { invoiceId: string }) {
  const { navigate } = useApp();
  const { theme } = useTheme();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [downloadedUri, setDownloadedUri] = useState<string | null>(null);

  const status = invoice ? statusConfig[invoice.status as InvoiceStatus] ?? statusConfig.pending : null;

  const loadInvoice = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getInvoice(invoiceId);
      setInvoice(data);
      cacheInvoice(invoiceId, data);
    } catch (caught) {
      const cached = getCachedInvoice(invoiceId);
      if (cached) {
        setInvoice(cached);
      } else {
        setError(caught instanceof Error ? caught.message : "Could not load invoice");
      }
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => { loadInvoice(); }, [loadInvoice]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const uri = await downloadInvoicePdf(invoiceId);
      setDownloadedUri(uri);
      Alert.alert("Downloaded", "Invoice PDF saved to device.");
    } catch (caught) {
      Alert.alert("Download failed", caught instanceof Error ? caught.message : "Could not download PDF");
    } finally {
      setDownloading(false);
    }
  }, [invoiceId]);

  const handleSharePdf = useCallback(async () => {
    try {
      const uri = downloadedUri || await downloadInvoicePdf(invoiceId);
      if (!downloadedUri) setDownloadedUri(uri);
      await sharePdf(uri, `Invoice ${invoice?.invoiceNumber}`);
    } catch (caught) {
      Alert.alert("Share failed", caught instanceof Error ? caught.message : "Could not share PDF");
    }
  }, [invoiceId, downloadedUri, invoice]);

  const handleShareLink = useCallback(async () => {
    if (!invoice) return;
    const url = getPublicInvoiceUrl(invoice.verificationCode);
    if (!url) return Alert.alert("Unavailable", "Invoice verification URL is not available.");
    await Share.share({ message: `Invoice ${invoice.invoiceNumber}: ${url}`, url });
  }, [invoice]);

  const handleCopyNumber = useCallback(() => {
    if (!invoice) return;
    Clipboard.setStringAsync(invoice.invoiceNumber);
    Alert.alert("Copied", "Invoice number copied to clipboard.");
  }, [invoice]);

  const handleCopyVerificationLink = useCallback(() => {
    if (!invoice) return;
    const url = getPublicInvoiceUrl(invoice.verificationCode);
    if (!url) return Alert.alert("Unavailable", "Verification link not available.");
    Clipboard.setStringAsync(url);
    Alert.alert("Copied", "Verification link copied to clipboard.");
  }, [invoice]);

  const handleOpenOrder = useCallback(() => {
    if (!invoice?.subscriptionId) return;
    navigate("orders");
  }, [invoice, navigate]);

  const handleVerify = useCallback(() => {
    if (!invoice?.verificationCode) return;
    const url = getPublicInvoiceUrl(invoice.verificationCode);
    if (url) Linking.openURL(url);
  }, [invoice]);

  if (loading) {
    return (
      <Screen>
        <View style={{ gap: spacing.md }}>
          <Skeleton height={80} radiusValue={14} />
          <Skeleton height={160} radiusValue={14} />
          <Skeleton height={120} radiusValue={14} />
          <Skeleton height={100} radiusValue={14} />
        </View>
      </Screen>
    );
  }

  if (error && !invoice) {
    return (
      <Screen>
        <ErrorState message={error} onRetry={loadInvoice} />
      </Screen>
    );
  }

  if (!invoice) {
    return (
      <Screen>
        <ErrorState message="Invoice not found" onRetry={loadInvoice} />
      </Screen>
    );
  }

  return (
    <Screen>
      <InfoCard style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text style={[detailStyles.invoiceNumber, { color: theme.colors.text }]}>
            {invoice.invoiceNumber}
          </Text>
          <Text style={[detailStyles.issuedDate, { color: theme.colors.textMuted }]}>
            Issued {formatDate(invoice.issuedAt || invoice.createdAt)}
          </Text>
        </View>
        {status && (
          <View style={[detailStyles.statusBadge, { backgroundColor: status.bgColor }]}>
            <Text style={[detailStyles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        )}
      </InfoCard>

      <InfoCard>
        <DetailRow label="Invoice Number" value={invoice.invoiceNumber} mono />
        <DetailRow label="Order / Subscription" value={invoice.subscriptionId || "N/A"} />
        <DetailRow label="Issued" value={formatDateTime(invoice.issuedAt || invoice.createdAt)} />
        {invoice.paidAt && <DetailRow label="Paid" value={formatDateTime(invoice.paidAt)} />}
        {invoice.dueDate && <DetailRow label="Due Date" value={formatDate(invoice.dueDate)} />}
        <DetailRow label="Status" value={status?.label || invoice.status} />
      </InfoCard>

      <SectionTitle title="Billing" />
      <InfoCard>
        <DetailRow label="Plan" value={typeof invoice.planId === "object" ? invoice.planId.name : "Subscription"} />
        <DetailRow label="Duration" value={invoice.duration?.replace("_", " ") ?? "N/A"} />
        {invoice.billingPeriodStart && <DetailRow label="Period Start" value={formatDate(invoice.billingPeriodStart)} />}
        {invoice.billingPeriodEnd && <DetailRow label="Period End" value={formatDate(invoice.billingPeriodEnd)} />}
      </InfoCard>

      <SectionTitle title="Payment" />
      <InfoCard>
        <DetailRow label="Subtotal" value={formatCurrency(invoice.subtotal, invoice.currency)} />
        {invoice.discount > 0 && <DetailRow label="Discount" value={`-${formatCurrency(invoice.discount, invoice.currency)}`} />}
        {invoice.vatAmount > 0 && <DetailRow label="VAT" value={formatCurrency(invoice.vatAmount, invoice.currency)} />}
        {invoice.taxAmount > 0 && <DetailRow label="Tax" value={formatCurrency(invoice.taxAmount, invoice.currency)} />}
        <View style={[detailStyles.totalRow, { borderTopColor: theme.colors.divider }]}>
          <Text style={[detailStyles.totalLabel, { color: theme.colors.text }]}>Total</Text>
          <Text style={[detailStyles.totalValue, { color: theme.colors.text }]}>
            {formatCurrency(invoice.total, invoice.currency)}
          </Text>
        </View>
        {invoice.gateway && <DetailRow label="Gateway" value={invoice.gateway} />}
        {invoice.transactionId && <DetailRow label="Transaction" value={invoice.transactionId} mono />}
        {invoice.senderNumber && <DetailRow label="Sender Number" value={invoice.senderNumber} />}
      </InfoCard>

      {invoice.companyName && (
        <>
          <SectionTitle title="Company" />
          <InfoCard>
            <DetailRow label="Name" value={invoice.companyName} />
            {invoice.companyAddress && <DetailRow label="Address" value={invoice.companyAddress} />}
            {invoice.companyPhone && <DetailRow label="Phone" value={invoice.companyPhone} />}
            {invoice.companyEmail && <DetailRow label="Email" value={invoice.companyEmail} />}
            {invoice.companyWebsite && <DetailRow label="Website" value={invoice.companyWebsite} />}
            {invoice.companyTaxId && <DetailRow label="Tax ID" value={invoice.companyTaxId} />}
          </InfoCard>
        </>
      )}

      {invoice.timeline && invoice.timeline.length > 0 && (
        <>
          <SectionTitle title="Timeline" />
          <InfoCard style={{ paddingBottom: spacing.sm }}>
            {invoice.timeline.map((event, index) => (
              <TimelineItem
                key={index}
                event={event}
                isLast={index === (invoice.timeline?.length ?? 0) - 1}
              />
            ))}
          </InfoCard>
        </>
      )}

      <SectionTitle title="Actions" />
      <View style={detailStyles.actionsGrid}>
        <ActionButton icon="download" label="Download PDF" onPress={handleDownload} />
        <ActionButton icon="share" label="Share PDF" onPress={handleSharePdf} />
        <ActionButton icon="link" label="Share Link" onPress={handleShareLink} />
        <ActionButton icon="copy" label="Copy Number" onPress={handleCopyNumber} />
        <ActionButton icon="link" label="Copy Verify Link" onPress={handleCopyVerificationLink} />
        <ActionButton icon="eye" label="Verify Online" onPress={handleVerify} />
        <ActionButton icon="checkmark" label="View in Browser" onPress={() => {
          const url = invoice.verificationCode
            ? getPublicInvoiceUrl(invoice.verificationCode)
            : null;
          if (url) Linking.openURL(url);
        }} />
      </View>
    </Screen>
  );
}

const detailStyles = StyleSheet.create({
  invoiceNumber: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  issuedDate: {
    fontSize: 12,
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
  },
  infoCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    flex: 1.5,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 17,
    fontWeight: "800",
  },
  timelineRow: {
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 48,
  },
  timelineLine: {
    width: 20,
    alignItems: "center",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineConnector: {
    width: 1.5,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  timelineEvent: {
    fontSize: 14,
    fontWeight: "600",
  },
  timelineDate: {
    fontSize: 11,
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
});
