import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateCustomerMetrics,
  buildCustomerReportHtml,
} from "../customer-report-pdf";
import type { StoreCustomer } from "@/redux/api/store-customers-api";

const mockCustomers: StoreCustomer[] = [
  {
    _id: "cust_1",
    storeId: "store_123",
    name: "Mohammad Nayeem",
    email: "nayeem@example.com",
    phone: "01700000001",
    avatar: "",
    status: "active",
    lastLoginAt: "2026-09-01T10:00:00.000Z",
    totalOrders: 5,
    completedOrders: 4,
    cancelledOrders: 1,
    totalSpent: 12500,
    lastOrderDate: "2026-09-01T10:00:00.000Z",
    averageOrderValue: 2500,
    notes: "",
    tags: ["vip"],
    isGuest: false,
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
  {
    _id: "cust_2",
    storeId: "store_123",
    name: "Shahidul Islam",
    email: "shahid@example.com",
    phone: "01800000002",
    avatar: "https://example.com/avatar.jpg",
    status: "inactive",
    lastLoginAt: null,
    totalOrders: 2,
    completedOrders: 2,
    cancelledOrders: 0,
    totalSpent: 3000,
    lastOrderDate: "2026-08-20T10:00:00.000Z",
    averageOrderValue: 1500,
    notes: "",
    tags: [],
    isGuest: false,
    createdAt: "2026-03-10T10:00:00.000Z",
    updatedAt: "2026-08-20T10:00:00.000Z",
  },
];

describe("Customer Report PDF Generator", () => {
  it("accurately calculates customer metrics", () => {
    const metrics = calculateCustomerMetrics(mockCustomers);
    assert.equal(metrics.totalCustomers, 2);
    assert.equal(metrics.activeCustomers, 1);
    assert.equal(metrics.inactiveCustomers, 1);
    assert.equal(metrics.totalOrders, 7);
    assert.equal(metrics.totalSpent, 15500);
    assert.equal(metrics.averageOrderValue, Math.round(15500 / 7));
  });

  it("builds clean, printable HTML with store branding and table formatting", () => {
    const html = buildCustomerReportHtml({
      storeName: "Fashion Emporium",
      storeLogoUrl: "https://example.com/logo.png",
      title: "Customer Directory",
      customers: mockCustomers,
      currencySettings: { currency: "BDT", symbol: "৳" },
    });

    assert.ok(html.includes("Fashion Emporium"));
    assert.ok(html.includes("https://example.com/logo.png"));
    assert.ok(html.includes("Customer Directory"));
    assert.ok(html.includes("Mohammad Nayeem"));
    assert.ok(html.includes("Shahidul Islam"));
    assert.ok(html.includes("thead {"));
    assert.ok(html.includes("display: table-header-group;"));
    assert.ok(html.includes("page-break-inside: avoid;"));
  });

  it("handles empty customers list safely", () => {
    const html = buildCustomerReportHtml({
      storeName: "Empty Shop",
      customers: [],
    });

    assert.ok(html.includes("Empty Shop"));
    assert.ok(html.includes("No customer records found"));
  });
});
