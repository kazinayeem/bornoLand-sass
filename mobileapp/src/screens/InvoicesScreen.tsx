import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { radius, spacing, useTheme, type AppTheme } from "../theme";
import { AppButton, Badge, Card, EmptyState, ErrorState, Icon, Screen, SearchBox, Skeleton } from "../components/ui";
import { getInvoices } from "../features/invoices/invoice-api";
import type { Invoice, InvoiceStatus } from "../features/invoices/invoice-types";

const statusConfig: Record<InvoiceStatus, { label: string; icon: keyof typeof import("../components/ui").glyphs; color: string }> = {
  paid: { label: "Paid", icon: "checkmark", color: "#14865a" },
  pending: { label: "Pending", icon: "time", color: "#b66a08" },
  rejected: { label: "Failed", icon: "warning", color: "#c93140" },
  refunded: { label: "Refunded", icon: "refresh", color: "#7c3aed" },
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

function InvoiceCard({
  invoice,
  onPress,
  index,
}: {
  invoice: Invoice;
  onPress: () => void;
  index: number;
}) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      delay: index * 40,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  const status = statusConfig[invoice.status as InvoiceStatus] ?? statusConfig.pending;
  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          localStyles.card,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
      >
        <View style={localStyles.cardTop}>
          <View style={[localStyles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[localStyles.invoiceNumber, { color: theme.colors.text }]}>
            {invoice.invoiceNumber}
          </Text>
          <View style={{ flex: 1 }} />
          <Text style={[localStyles.amount, { color: theme.colors.text }]}>
            {formatCurrency(invoice.total, invoice.currency)}
          </Text>
        </View>
        <View style={localStyles.cardBottom}>
          <Text style={[localStyles.planName, { color: theme.colors.textMuted }]}>
            {typeof invoice.planId === "object" ? invoice.planId.name : "Subscription"}
            {" · "}
            {invoice.duration?.replace("_", " ") ?? "N/A"}
          </Text>
          <Badge tone={invoice.status as "success" | "warning" | "danger" | "primary"} label={status.label} />
        </View>
        <Text style={[localStyles.date, { color: theme.colors.textSoft }]}>
          Issued {formatDate(invoice.issuedAt || invoice.createdAt)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function FilterPills({
  statuses,
  selected,
  onSelect,
}: {
  statuses: string[];
  selected: string | null;
  onSelect: (status: string | null) => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={localStyles.filterRow}>
      <Pressable
        onPress={() => onSelect(null)}
        style={[
          localStyles.filterPill,
          { backgroundColor: selected === null ? theme.colors.primary : theme.colors.control },
        ]}
      >
        <Text style={[localStyles.filterText, { color: selected === null ? "#fff" : theme.colors.text }]}>
          All
        </Text>
      </Pressable>
      {statuses.map((s) => (
        <Pressable
          key={s}
          onPress={() => onSelect(selected === s ? null : s)}
          style={[
            localStyles.filterPill,
            { backgroundColor: selected === s ? theme.colors.primary : theme.colors.control },
          ]}
        >
          <Text style={[localStyles.filterText, { color: selected === s ? "#fff" : theme.colors.text }]}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function InvoicesScreen() {
  const { currentStore, navigate } = useApp();
  const { theme } = useTheme();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const statuses = useMemo(() => {
    const existing: Record<string, true> = {};
    invoices.forEach((inv) => { existing[inv.status] = true; });
    return (["paid", "pending", "rejected", "refunded"] as InvoiceStatus[]).filter((s) => existing[s]);
  }, [invoices]);

  const loadInvoices = useCallback(async (isRefresh = false) => {
    if (!currentStore) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const data = await getInvoices(currentStore._id);
      setInvoices(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load invoices");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentStore]);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  const sorted = useMemo(() => {
    let result = [...invoices];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.transactionId?.toLowerCase().includes(q)
      );
    }
    if (statusFilter)       result = result.filter((inv) => inv.status === (statusFilter as any));
    result.sort((a, b) => {
      const dateA = new Date(a.issuedAt || a.createdAt).getTime();
      const dateB = new Date(b.issuedAt || b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [invoices, searchQuery, statusFilter, sortOrder]);

  if (!currentStore) {
    return (
      <Screen>
        <Card>
          <EmptyState
            icon="receipt-outline"
            title="No Store Selected"
            message="Select a store to view invoices."
            action="Go to Stores"
            onAction={() => navigate("stores")}
          />
        </Card>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <View style={{ gap: spacing.md }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={100} radiusValue={14} />
          ))}
        </View>
      </Screen>
    );
  }

  if (error && invoices.length === 0) {
    return (
      <Screen>
        <ErrorState message={error} onRetry={() => loadInvoices()} />
      </Screen>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => loadInvoices(true)}>
      {invoices.length > 5 && (
        <SearchBox
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by invoice number…"
        />
      )}

      <View style={localStyles.toolbar}>
        <FilterPills statuses={statuses} selected={statusFilter} onSelect={setStatusFilter} />
        <Pressable
          onPress={() => setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))}
          style={[localStyles.sortBtn, { backgroundColor: theme.colors.control }]}
        >
          <Ionicons
            name="arrow-up-outline"
            size={14}
            color={theme.colors.text}
            style={{ transform: [{ rotate: sortOrder === "newest" ? "0deg" : "180deg" }] }}
          />
          <Text style={[localStyles.sortText, { color: theme.colors.text }]}>
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </Text>
        </Pressable>
      </View>

      {sorted.length === 0 ? (
        <Card>
          <EmptyState
            icon="receipt-outline"
            title={searchQuery || statusFilter ? "No matching invoices" : "No invoices yet"}
            message={
              searchQuery || statusFilter
                ? "Try adjusting your search or filter."
                : "Invoices will appear here after subscription payments."
            }
          />
        </Card>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {sorted.map((invoice, index) => (
            <InvoiceCard
              key={invoice._id}
              invoice={invoice}
              index={index}
              onPress={() => navigate("invoice-detail", { invoiceId: invoice._id })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const localStyles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
  },
  planName: {
    fontSize: 12,
    flex: 1,
    marginRight: spacing.sm,
  },
  date: {
    fontSize: 11,
    paddingLeft: 16,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.xs,
    flex: 1,
    flexWrap: "wrap",
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  sortText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
