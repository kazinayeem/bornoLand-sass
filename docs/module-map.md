# BornoLand Module & Domain Registry

## 1. Domain Organization

| Domain | Functional Scope | Key UI Routes | Backend Route Prefix |
| :--- | :--- | :--- | :--- |
| **1. Core & Commerce** | Products, Variants, Categories, Orders, Cart, Customers, Reviews | `/products`, `/categories`, `/orders`, `/customers`, `/reviews` | `/:storeId/products`, `/:storeId/orders`, `/:storeId/customers` |
| **2. POS** | Cashier Register, Barcode Scanning, Shifts & Float Reconcile | `/pos`, `/pos/shifts` | `/:storeId/pos` |
| **3. Inventory & Procurement** | Multi-Warehouse, Stock Ledger, POs, Suppliers, Waste/Loss | `/inventory`, `/inventory/warehouses`, `/inventory/purchasing`, `/inventory/suppliers`, `/inventory/waste`, `/inventory/ledger` | `/:storeId/inventory` |
| **4. People & HRM** | Employee Master, Departments, Attendance, Leaves, Auditable Payroll, Self-Service | `/hrm/employees`, `/hrm/organization`, `/hrm/attendance`, `/hrm/leaves`, `/hrm/payroll`, `/hrm/self-service` | `/:storeId/hrm` |
| **5. Finance & Accounting** | Chart of Accounts, General Journal, Expense Vouchers, P&L, Balance Sheet, Trial Balance | `/finance/accounting`, `/finance/expenses`, `/finance/reports` | `/:storeId/accounting` |
| **6. CRM & Growth** | Deals Pipeline, Kanban Board, Lead Stages, Customer 360 | `/crm/deals` | `/:storeId/crm` |
| **7. Customer Support** | Support Desk Tickets, Live Thread Messaging, Resolution Workflow | `/support/tickets` | `/:storeId/support` |
| **8. Operations** | Task Queue, Multi-Step Approvals, Inspection Matrix | `/operations/tasks` | `/:storeId/operations` |
| **9. Marketing & Builder** | Coupons, Pixel Tracking, Theme Builder, Pages, Menus | `/coupons`, `/marketing`, `/appearance/branding`, `/builder` | `/:storeId/marketing`, `/:storeId/pages` |
| **10. Settings & System** | Store Settings, Shipping Zones, Couriers, Payment Gateways, Team Members | `/settings`, `/settings/shipping`, `/settings/courier`, `/settings/payments`, `/members` | `/:storeId/settings`, `/:storeId/members` |
