# BornoLand Master Platform Architecture (bornoland-platform-architecture.md)

## 1. System Topology & Philosophy

BornoLand is an enterprise-grade multi-tenant **Business Operating System (BOS)** integrating **Commerce, Operations, People (HRM), Finance, and Growth (CRM & Marketing)** under a single unified data model and authentication envelope.

```
                    BORNOLAND PLATFORM TOPOLOGY
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     │                           │                           │
  [Public SaaS Landing]    [Public Storefront]      [Merchant Workspace]
  • `/`, `/pricing`        • `*.bornoland.com`      • `/store/[slug]/*`
  • `/login`, `/register`  • `/site/[tenant]/*`     • POS, HRM, Finance,
  • Onboarding & Stores    • Public Catalog/Cart      Inventory, CRM, POs
     │                           │                           │
     └───────────────────────────┼───────────────────────────┘
                                 │ HTTP (Express API / Next.js)
                                 ▼
                     [Core Security Pipeline]
                     1. JWT Session Authentication
                     2. Multi-Tenant Resolution (`storeId`)
                     3. Plan & Module Entitlements
                     4. Granular Member RBAC Verification
                                 │
                                 ▼
                    [Canonical Database (MongoDB)]
                     • Single Collection Authority
                     • Compound Multi-Tenant Indexes
                     • Atomic Stock & Journal Updates
```

---

## 2. Domain & Module Registry

| Domain | Key Modules | Functional Scope | Canonical Data Models |
| :--- | :--- | :--- | :--- |
| **Commerce** | Storefront, Builder, Catalog, Orders, Checkout, Reviews | Online shopping, drag & drop page builder, orders, and courier delivery tracking. | `Store`, `Product`, `ProductVariant`, `Order`, `Customer`, `StorePage` |
| **Operations** | POS Terminal, POS Shifts, Stock Ledger, Warehouses, Purchasing, Waste Tracker | High-speed register sales, cash float reconciliation, stock audit trail, and PO receiving. | `StockLog`, `WasteLog`, `InventoryWarehouse`, `InventorySupplier`, `InventoryPurchaseOrder`, `PosShift` |
| **People (HRM)** | Employees, Departments, Attendance, Leaves, Monthly Payroll, Self-Service | Employee onboarding, daily clock-in/out, overtime, leave approvals, and printable payslips. | `HrmEmployee`, `HrmDepartment`, `HrmDesignation`, `HrmShift`, `HrmAttendance`, `HrmLeave`, `HrmPayroll` |
| **Finance** | Chart of Accounts, General Journal, Expense Vouchers, Financial Reports | Double-entry journal vouchers ($\sum \text{Debits} = \sum \text{Credits}$), auto-expense posting, Trial Balance, P&L, Balance Sheet. | `AccountingAccount`, `AccountingJournalEntry`, `AccountingExpense` |
| **Growth** | CRM Deals Pipeline, Customer Support Desk, Operations Workflows | Sales pipeline Kanban board, customer support message threads, and multi-step approvals. | `CrmDeal`, `SupportTicket`, `OperationTask` |

---

## 3. End-to-End Business Data Flows

### A. Procurement to Sales Lifecycle (`Buy → Store → Sell → Settle`)
1. **Purchase Order**: Created in Purchasing with unit buying prices and target warehouse.
2. **Receiving**: Stock atomically increases; `StockLog` creates a `PURCHASE` movement entry; Accounts Payable voucher posted in General Ledger.
3. **Sale (POS / Storefront)**: Cashier or customer places order; inventory decremented atomically (`SALE` / `POS_SALE`); COGS computed based on True Cost.
4. **Settlement**: Payment recorded against cash drawer or payment gateway; General Ledger posts Revenue and COGS entries.

### B. Workforce to Payroll Lifecycle (`People → Finance`)
1. **Attendance**: Daily clock-in/out records late minutes and overtime hours.
2. **Leaves**: Approved unpaid leaves decrement payable working days.
3. **Payroll Run**: Monthly payroll engine computes:
   $$\text{Net Salary} = (\text{Basic} + \text{Allowances} + \text{Overtime}) - (\text{Tax} + \text{PF} + \text{Unpaid Leaves})$$
4. **Journal Posting**: Generates numbered payslips (`PS-YYYYMM-XXXX`) and posts Salary Expense voucher to General Ledger.

---

## 4. UI/UX Design System: Nordic Yellow Standard
- **Primary Brand Color**: `#003399` (Blue)
- **Primary Hover**: `#002B80`
- **Secondary / Accent**: `#FFDA1A` (Yellow accent with `#111111` text, never yellow on white)
- **Surfaces & Background**: `#FFFFFF` surface on `#F5F5F5` canvas with flat Level 1 elevation (`0 1px 3px rgba(17,17,17,0.06)`).
- **Standard Dimensions**: $44\text{px}$ touch height, $4\text{px}$ element radius, $12\text{px}$ modal radius.
