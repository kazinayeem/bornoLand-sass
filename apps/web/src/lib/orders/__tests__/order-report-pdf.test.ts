import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateOrderMetrics,
  computeDailyBreakdown,
  buildOrderReportHtml,
} from "../order-report-pdf";
import type { StoreOrder } from "@/redux/api/store-order-api";

const mockOrders: StoreOrder[] = [
  {
    _id: "order_1",
    storeId: "store_123",
    orderNumber: "1001",
    customerId: { _id: "c1", name: "Rahim Ali", email: "rahim@example.com", phone: "01700000001" },
    items: [{ productId: "p1", name: "T-Shirt", price: 500, quantity: 2, image: "" }],
    subtotal: 1000,
    shipping: 60,
    deliveryCharge: 60,
    deliveryZone: "inside",
    discount: 0,
    total: 1060,
    status: "delivered",
    paymentMethod: "bKash",
    paymentStatus: "paid",
    shippingAddress: {
      fullName: "Rahim Ali",
      phone: "01700000001",
      street: "Road 1",
      city: "Dhaka",
      state: "Dhaka",
      zip: "1200",
    },
    notes: "",
    currencyCode: "BDT",
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T12:00:00.000Z",
  },
  {
    _id: "order_2",
    storeId: "store_123",
    orderNumber: "1002",
    customerId: { _id: "c2", name: "Karim Khan", email: "karim@example.com", phone: "01800000002" },
    items: [{ productId: "p2", name: "Pants", price: 1200, quantity: 1, image: "" }],
    subtotal: 1200,
    shipping: 100,
    deliveryCharge: 100,
    deliveryZone: "outside",
    discount: 100,
    total: 1200,
    status: "processing",
    paymentMethod: "COD",
    paymentStatus: "unpaid",
    shippingAddress: {
      fullName: "Karim Khan",
      phone: "01800000002",
      street: "Road 2",
      city: "Chittagong",
      state: "Chittagong",
      zip: "4000",
    },
    notes: "",
    currencyCode: "BDT",
    createdAt: "2026-09-01T14:30:00.000Z",
    updatedAt: "2026-09-01T15:00:00.000Z",
  },
  {
    _id: "order_3",
    storeId: "store_123",
    orderNumber: "1003",
    customerId: { _id: "c3", name: "Fatima Begum", email: "fatima@example.com" },
    items: [{ productId: "p3", name: "Scarf", price: 300, quantity: 1, image: "" }],
    subtotal: 300,
    shipping: 60,
    deliveryCharge: 60,
    deliveryZone: "inside",
    discount: 0,
    total: 360,
    status: "cancelled",
    paymentMethod: "COD",
    paymentStatus: "unpaid",
    shippingAddress: {
      fullName: "Fatima Begum",
      phone: "01900000003",
      street: "Road 3",
      city: "Dhaka",
      state: "Dhaka",
      zip: "1205",
    },
    notes: "",
    currencyCode: "BDT",
    createdAt: "2026-09-02T09:15:00.000Z",
    updatedAt: "2026-09-02T10:00:00.000Z",
  },
];

describe("Order Report PDF Generation", () => {
  it("calculates accurate order metrics across statuses and revenues", () => {
    const metrics = calculateOrderMetrics(mockOrders);

    assert.equal(metrics.totalOrders, 3);
    assert.equal(metrics.totalRevenue, 1060 + 1200 + 360);
    assert.equal(metrics.averageOrderValue, Math.round((1060 + 1200 + 360) / 3));
    assert.equal(metrics.deliveredCount, 1);
    assert.equal(metrics.processingCount, 1);
    assert.equal(metrics.cancelledCount, 1);
    assert.equal(metrics.paidCount, 1);
    assert.equal(metrics.unpaidCount, 2);
  });

  it("computes chronological daily breakdown for monthly reports", () => {
    const money = (v: number) => `৳${v}`;
    const breakdown = computeDailyBreakdown(mockOrders, money);

    assert.equal(breakdown.length, 2);
    // Day 1 (2026-09-01) has 2 orders
    assert.equal(breakdown[0].date, "2026-09-01");
    assert.equal(breakdown[0].ordersCount, 2);
    assert.equal(breakdown[0].revenue, 2260);
    assert.equal(breakdown[0].deliveredCount, 1);

    // Day 2 (2026-09-02) has 1 order
    assert.equal(breakdown[1].date, "2026-09-02");
    assert.equal(breakdown[1].ordersCount, 1);
    assert.equal(breakdown[1].revenue, 360);
  });

  it("builds clean, printable HTML with store branding and table formatting", () => {
    const html = buildOrderReportHtml({
      storeName: "Fashion Hub",
      storeLogoUrl: "https://example.com/logo.png",
      reportType: "monthly",
      title: "Monthly Sales Report",
      subtitle: "Performance review",
      dateLabel: "September 2026",
      orders: mockOrders,
      currencySettings: { currency: "BDT", symbol: "৳" },
    });

    // Branding checks
    assert.ok(html.includes("Fashion Hub"));
    assert.ok(html.includes("https://example.com/logo.png"));
    assert.ok(html.includes("Monthly Sales Report"));

    // Multi-page printable styling checks
    assert.ok(html.includes("thead {"));
    assert.ok(html.includes("display: table-header-group;"));
    assert.ok(html.includes("page-break-inside: avoid;"));

    // Order records checks
    assert.ok(html.includes("#1001"));
    assert.ok(html.includes("Rahim Ali"));
    assert.ok(html.includes("#1002"));
    assert.ok(html.includes("Karim Khan"));

    // Daily breakdown table checks
    assert.ok(html.includes("Daily Sales Breakdown"));
  });

  it("safely handles empty orders without crashing", () => {
    const html = buildOrderReportHtml({
      storeName: "Empty Boutique",
      reportType: "daily",
      title: "Daily Report",
      orders: [],
    });

    assert.ok(html.includes("Empty Boutique"));
    assert.ok(html.includes("No order records found for this period"));
  });
});
