# BornoLand Comprehensive Test & Verification Suite

## 1. End-to-End Scenarios Tested

### Scenario 1: Product Master & Variant Pricing
- **Action**: Created product with buying price, selling price, and SKU variants.
- **Verification**: Buying price concealed from customer storefront; correct gross profit margin calculated.

### Scenario 2: Purchase Order & Stock Inward
- **Action**: Created PO for wholesale supplier, processed warehouse receiving modal.
- **Verification**: Central inventory stock incremented; stock movement ledger recorded purchase; accounts payable voucher created.

### Scenario 3: Point of Sale (POS) Cashier Sales & Shift Reconcile
- **Action**: Opened POS shift with cash float, processed barcode checkout, performed drawer count and shift close.
- **Verification**: Order recorded, inventory decremented, drawer variance audited with zero discrepancy.

### Scenario 4: HRM Employee Attendance & Monthly Payroll Run
- **Action**: Employee clock-in/out, recorded overtime, approved leave request, generated monthly payroll run.
- **Verification**: Payslip `PS-YYYYMM-XXXX` generated with basic, allowances, overtime, and deductions; salary expense voucher posted to general ledger.

### Scenario 5: Financial Statements & Balanced Journal
- **Action**: Logged operational expenses, reviewed Trial Balance, Profit & Loss, and Balance Sheet.
- **Verification**: Trial Balance debits equal credits ($\sum \text{Debits} = \sum \text{Credits}$); Net Profit reflected correctly on Balance Sheet equity.

### Scenario 6: CRM Deals Pipeline & Customer 360
- **Action**: Created CRM deal from customer, progressed stage to "Closed Won".
- **Verification**: Deal metrics updated; customer order history and lifetime value aggregated into Customer 360 profile.

---

## 2. Production Build Verification

| Component | Test Command | Result |
| :--- | :--- | :--- |
| **Backend API** | `pnpm --filter @bornoland/api build` | **PASS (Exit Code 0)** |
| **Frontend Web** | `pnpm --filter @bornoland/web build` | **PASS (Exit Code 0 — 90+ routes)** |
