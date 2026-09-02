# BornoLand End-to-End Business Workflows

## 1. The Core Lifecycle: Buy → Store → Sell → Settle → Account

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 1. PURCHASE  │ ──► │ 2. RECEIVE   │ ──► │ 3. INVENTORY │ ──► │ 4. SELL (POS │
│ Supplier PO  │     │ Stock Count  │     │ Audit Ledger │     │  / Online)   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│ 7. REPORT    │ ◄── │ 6. ACCOUNT   │ ◄── │ 5. PAYMENT   │ ◄──────────┘
│ P&L / B-Sheet│     │ Debit/Credit │     │ Cash/Card/MFS│
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 2. Granular Workflow Specifications

### Step 1: Procurement & Receiving (Buy → Store)
1. **Supplier Selection**: Vendor selected from [`suppliers master`](file:///Users/mohammadalinayeem/Project%20&%20Code/bornoland/apps/web/src/app/(store)/store/[storeSlug]/(shell)/inventory/suppliers/page.tsx).
2. **Purchase Order**: Created with unit buying price, expected quantities, target destination warehouse.
3. **Goods Receiving**: Warehouse manager verifies delivered quantities.
4. **Inventory Movement**: Stock level increases atomically; stock movement ledger logs entry (`type: "PURCHASE"`, `quantity`, `unitCost`, `actor`).
5. **Accounts Payable**: Accounts payable voucher created in general ledger balancing with inventory assets.

### Step 2: Sales & Fulfillment (Sell → Transact)
1. **Catalog Lookup**: Cashier/Customer selects product or variant (buying price hidden from customer view).
2. **Stock Reservation & Check**: Real-time validation against warehouse/store availability.
3. **Order Placement**:
   - POS sale created with payment method breakdown (Cash, Card, MFS).
   - Cash drawer records tender and shift counter updates.
4. **Inventory Decrement**: Stock ledger automatically decrements (`type: "POS_SALE"` or `"SALE"`).
5. **COGS & Gross Profit**:
   $$\text{COGS} = \text{Sold Quantity} \times \text{Unit True Cost}$$
   $$\text{Gross Profit} = \text{Revenue} - \text{COGS}$$

### Step 3: Returns & Waste Write-Offs
1. **Waste/Loss Tracker**: Records spoilage, broken items, or expired goods.
2. **Stock Adjustment**: Inventory decremented under reason code (`DAMAGED`, `EXPIRED`, `LOST`).
3. **Loss Valuation**: Computed based on unit cost and posted to Expense / Loss on Spoilage account.

### Step 4: Workforce & Payroll Cycle (People → Finance)
1. **Attendance Tracking**: Clock-in/out, late minutes, and overtime calculation.
2. **Leave Approvals**: Multi-tier leave deductions (unpaid days).
3. **Payroll Run**:
   $$\text{Net Pay} = (\text{Basic} + \text{Allowances} + \text{Overtime}) - (\text{Tax} + \text{PF} + \text{Unpaid Leaves})$$
4. **General Ledger Entry**:
   - Debit: Salary Expense
   - Credit: Payroll Payable / Cash Bank

### Step 5: Customer 360 & Growth (CRM → Marketing)
1. **Unified Profile**: Aggregates e-commerce orders, POS transactions, lifetime spend, CRM sales deals, and support tickets.
2. **Deals Pipeline**: Leads move through *Contacted $\rightarrow$ Proposal Sent $\rightarrow$ Negotiation $\rightarrow$ Closed Won*.
3. **Retention & Campaigns**: Segment customers by purchase behavior to target coupons and promotions.
