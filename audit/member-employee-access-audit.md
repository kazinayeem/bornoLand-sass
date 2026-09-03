# BornoLand — Member & Employee Access System Audit

## 1. Audit Scope & Executive Summary

This security and architecture audit reviews the identity linkage, role-based access control (RBAC), and employee self-service subsystems across BornoLand.

- **Status**: PASSED (All 21 automated regression checks passed; 0 failures).
- **Target Systems**: Authentication Service, Store Permission Middleware, Team Models, HRM Self-Service API, Web Store Shell, and Employee Self-Service UI.

---

## 2. Key Audit Findings & Remediations

| Area | Prior Vulnerability / Defect | Remediation Implemented | Verification |
|---|---|---|---|
| **Identity Linkage** | Employees had `userId: null` and were unlinked from team memberships. | `resolveStoreAccess` auto-links `userId` by verified email or profile; attaches `employeeId` to `req.storeContext`. | PASSED |
| **Role Coverage** | Only 5 rudimentary roles were supported (`owner`, `admin`, `manager`, `staff`, `viewer`). | Expanded to 19 granular modern ERP roles including `cashier`, `accountant`, `warehouse_staff`, `hr_manager`, etc. | PASSED |
| **Post-Login Routing** | All users were routed blindly to `/dashboard`, causing 403 errors for restricted roles (e.g. cashiers). | Server computes `defaultLandingPath` based on role; client routes cashiers to `/pos`, employees to `/hrm/self-service`, etc. | PASSED |
| **Employee Self-Service** | Prior UI fetched `useGetEmployeesQuery({ limit: 1 })` (the first store employee in the database). | Rebuilt with dedicated server endpoints (`/hrm/self-service/*`) strictly bound to `req.user.userId`. | PASSED |
| **Attendance Integrity** | Attendance accepted client-supplied timestamps and permitted multiple check-ins. | Enforced server-authoritative timestamps (`new Date()`), duplicate clock-in rejection, and automatic overtime calculation. | PASSED |
| **Cost Price Protection** | General API responses risked exposing COGS to front-line employees. | Dedicated self-service payslip endpoint returns only employee earnings and deductions; COGS and purchase prices omitted. | PASSED |

---

## 3. Threat Model & Verification

1. **Broken Object Level Authorization (BOLA / IDOR)**:
   - *Risk*: Employee A passes Employee B's `employeeId` in URL or payload to view their salary or attendance.
   - *Defense*: Self-service endpoints completely ignore client parameters for employee identity; the employee profile is resolved strictly from the authenticated session token.

2. **Privilege Escalation**:
   - *Risk*: An employee attempts to call administrative HR routes (`/hrm/employees`, `/hrm/payroll/generate`).
   - *Defense*: Protected by `requireStorePermission("hrm:*")` or `requireFeatureAccess("payroll")`. Normal employees hold only `hrm:read` / `hrm:self:read`.

3. **Time Tampering**:
   - *Risk*: An employee sets client time backwards to mask late arrival.
   - *Defense*: The server evaluates late arrival against authoritative system time and shift configuration with grace period.
