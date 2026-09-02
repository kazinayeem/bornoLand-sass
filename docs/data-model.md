# BornoLand Canonical Data Model & Schema Map

## 1. Database Architecture Invariants

- **Multi-Tenant Scoping**: All operational and core collections contain `storeId: ObjectId` indexed with high-selectivity compound indexes.
- **Data Immutability**: Historical financial journal entries, closed POS shift summaries, approved payroll payslips, and completed purchase orders remain strictly immutable once closed/posted.
- **Single Entity Authority**: No duplicate collections exist for products, customers, stock, or ledger entries.

---

## 2. Canonical Collection Map

### A. Commerce & Catalog
- `stores`: Tenant master record, custom domain, subscription plan, branding.
- `products`: Product master with buying price, selling price, variants, stock threshold, category, brand.
- `categories` & `brands`: Taxonomy classifications.
- `orders`: Canonical order document containing line items, POS metadata, pricing snapshot, customer reference, payment records.
- `customers`: Customer master with contact info, total orders count, total spend, loyalty points.

### B. Operations & Inventory
- `stock_logs`: Comprehensive stock movement audit ledger recording `PURCHASE`, `SALE`, `POS_SALE`, `WASTE`, `DAMAGE`, `TRANSFER_IN`, `TRANSFER_OUT`, `ADJUSTMENT`.
- `waste_logs`: Damage and spoilage records with reason code, quantity, and unit cost valuation.
- `inventory_warehouses`: Facility locations, storage codes, manager assignments.
- `inventory_suppliers`: Vendor directory, contact details, payment terms.
- `inventory_purchase_orders`: Supplier purchase orders with line items, received quantities, unit buying costs.
- `pos_shifts`: Cashier register sessions, opening float, tender breakdown, closing drawer count, and variance auditing.

### C. People & Workforce (HRM)
- `hrm_employees`: Employee master profiles, salary structure, department, designation, user account linking.
- `hrm_departments` & `hrm_designations`: Organizational hierarchy.
- `hrm_shifts`: Work shifts with start time, end time, and grace period.
- `hrm_attendance`: Daily check-in/out, worked minutes, late minutes, overtime minutes.
- `hrm_leaves`: Leave requests with type (`casual`, `sick`, `annual`, `unpaid`), status, and manager approval remarks.
- `hrm_payrolls`: Monthly payroll records with basic, allowances, overtime, tax, PF deductions, net pay, and generated payslip ID.

### D. Finance & Double-Entry Accounting
- `accounting_accounts`: Chart of Accounts (COA) with account code, type (`asset`, `liability`, `equity`, `revenue`, `cogs`, `expense`), and running balance.
- `accounting_journal_entries`: Double-entry journal vouchers enforcing $\sum \text{Debits} = \sum \text{Credits}$.
- `accounting_expenses`: Expense vouchers with category, amount, payment method, and auto-journal posting link.

### E. Growth, Support & Operations Workflows
- `crm_deals`: Sales pipeline deals with stages (`lead`, `contacted`, `proposal_sent`, `negotiation`, `won`, `lost`), deal value, customer link.
- `support_tickets`: Customer support tickets with message thread history, priority, and resolution workflow.
- `operation_tasks`: Multi-step approval workflows and task management.
