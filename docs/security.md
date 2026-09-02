# BornoLand Security & Tenant Safety Architecture

## 1. Security Invariants

- **Multi-Tenant Isolation**: No database query is executed without explicit `storeId` binding.
- **IDOR Protection**: All modification endpoints check that the target resource belongs to the current authenticated user's store context (`storeOid(storeId)`).
- **Sensitive Cost Shielding**: Buying prices, supplier costs, and employee salary configurations are omitted from public serializers and non-admin payload models.
- **NoSQL Injection Defense**: Strict Mongoose schema casting with sanitized ObjectId converters (`oid()`, `storeOid()`).
- **Payment Verification Integrity**: Payment verification endpoints (e.g. SSLCommerz IPN / callbacks) require backend cryptographic signature verification and server-to-server transaction inquiry.
- **Double-Entry Balance Enforcement**: Journal entries will throw a validation error if total debits do not equal total credits.
