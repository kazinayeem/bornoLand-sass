# BornoLand Multi-Tenant Permissions & RBAC Architecture

## 1. Multi-Tier Authorization Pipeline

Access to any resource or action passes through 6 mandatory security layers:

```
[1. User Authentication (Bearer JWT)]
                  │
                  ▼
[2. Tenant Association (Store Membership)]
                  │
                  ▼
[3. Subscription Plan Check (Active / Trial)]
                  │
                  ▼
[4. Module Entitlement (Plan Feature Flags)]
                  │
                  ▼
[5. Granular Member Role & Permissions]
                  │
                  ▼
[6. Tenant Scoped Resource Execution]
```

---

## 2. Canonical Permission Keys

- `products:read`, `products:create`, `products:update`, `products:delete`
- `orders:read`, `orders:create`, `orders:update`, `orders:delete`
- `pos:read`, `pos:write`, `pos:shifts`
- `inventory:read`, `inventory:write`, `inventory:adjust`, `inventory:waste`
- `hrm:read`, `hrm:write`, `hrm:attendance`, `hrm:leaves`, `hrm:payroll`
- `accounting:read`, `accounting:write`, `accounting:expenses`, `accounting:reports`
- `crm:read`, `crm:write`
- `support:read`, `support:write`
- `operations:read`, `operations:write`, `operations:approve`
- `settings:read`, `settings:write`
- `members:read`, `members:write`

---

## 3. Sensitive Data Access Controls
- **Buying Price / Cost of Goods**: Strictly concealed from public storefronts, non-admin cashiers, and unauthorized staff roles.
- **Salary / Payroll Records**: Restricted exclusively to HR Managers, Accountants, Store Owners, and the individual employee via Self-Service.
- **Financial Statements**: Restricted to Store Owners and Accountants.
