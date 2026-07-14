# Workflow Audit Report

---

## 1. Pages Module: Remove Home from Pages

**Current:** `Pages` module includes a "Home" page alongside About, Privacy, FAQ, etc. The Home page is also managed in the Builder.

**Problem:** Dual management — Home is editable in both Pages and Builder. User confusion.

**Shopify Pattern:** Homepage is ONLY managed via the theme/builder. The Pages section contains only non-homepage static pages (About, Contact, FAQ, Terms, Shipping, Returns, Privacy).

**Recommended:** Remove Home from the Pages module entirely. Homepage is Builder-only. Filter it out in all Pages list views and remove the REST endpoint for Home in `/pages`.

---

## 2. Store Switching: Missing Context Persistence

**Current:** User logs in, sees a workspace dashboard, clicks a store card to enter store admin. The store slug is in the URL. Switching stores requires going back to /dashboard/stores.

**Problem:** No recent-store persistence. No quick-switcher.

**Shopify Pattern:** A global store switcher in the top nav bar with recent stores, search, and the current store name prominently displayed.

**Recommended:** Add a store switcher dropdown in the navbar showing the current store name. Include search, recently accessed stores, and a "Back to all stores" link.

---

## 3. Create Product Workflow: Missing Draft State

**Current:** Creating a product immediately sets it to active (or chosen status). No auto-save draft.

**Problem:** If the user navigates away mid-creation, all inputs are lost.

**Shopify Pattern:** Auto-save drafts every 30 seconds. Products start as "Draft" until explicitly published.

**Recommended:** Add auto-save with debounced API calls. New products default to `status: "draft"`. Show an "Unsaved changes" indicator.

---

## 4. Order Fulfillment: No Partial Fulfillment

**Current:** Orders have a single status. No item-level fulfillment tracking.

**Problem:** An order with 5 items where 3 are in stock and 2 need backordering — must fulfill all or nothing.

**Shopify Pattern:** Item-level fulfillment with tracking numbers per item/shipment. Partial fulfillments, tracking emails, delivery status.

**Recommended:** Add `OrderItem.fulfillmentStatus` (pending/fulfilled/partial/backordered), fulfillment events with tracking numbers, and customer notification triggers.

---

## 5. Billing Subscription Workflow: Fixed

**Current (after our fix):** User selects plan → duration → payment method → enters sender/transaction ID → submits → **PENDING** → Admin reviews → Approve/Reject.

**Good:** This is correct. No auto-approval.

**Still missing:** 
- No email notification when payment is approved/rejected
- No automatic invoice PDF generation
- No dunning (payment reminders before expiry)

---

## 6. Media Upload: No Progress Indication

**Current:** Files upload silently. User sees a spinner but no progress per file.

**Problem:** Large files appear to hang.

**Shopify Pattern:** Progress bar per file, upload queue with pause/resume/cancel, drag-and-drop zones showing accepted formats.

**Recommended:** Integrate with a library like `react-dropzone` + axios `onUploadProgress` for per-file progress.

---

## 7. Customer Registration: No Verification Flow

**Current:** Customer registers → immediately active. No email verification.

**Problem:** Fake accounts, spam registrations.

**Shopify Pattern:** Email verification required before first purchase. Optional social login.

**Recommended:** Add `customer.verified: boolean`. Send verification email on registration. Block checkout for unverified accounts.

---

## 8. Abandoned Cart: No Recovery

**Current:** Carts are stored but no recovery mechanism.

**Problem:** Lost revenue from abandoned checkouts.

**Shopify Pattern:** Abandoned checkout recovery emails at 1hr, 24hr, 72hr intervals with cart link and optional discount.

**Recommended:** Add a cron job that queries carts older than 1 hour with items, sends recovery email via the notification service.

---

## 9. Multi-Store Data Isolation: Partially Broken

**Current (from API audit):** 
- Products: ownership checked ✅
- Categories: ownership checked ✅
- Delivery zones: **NO ownership check** (any auth user can CRUD any store's delivery zones)
- Payment methods: **NO ownership check** (same issue)
- Analytics: **NO ownership check** (any auth user can view any store's analytics)

**Shopify Pattern:** Every store-scoped query MUST include `{ storeId, userId }` filter. Never trust the client to only send their own storeId.

**Fix:** Add `requireStoreAccess` middleware to delivery zones, payment methods, and analytics routes.

---

## 10. CMS/Blog: No Publishing Workflow

**Current:** CMS pages have a `published` boolean. No draft/preview/publish workflow.

**Problem:** Accidental publishing of incomplete content.

**Recommended:** Add `status: draft | published | scheduled` with `scheduledAt` date. Preview via secret token URL.
