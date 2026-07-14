# Implementation Roadmap
## Store Builder & Dashboard Production Readiness

**Created:** 2026-07-14  
**Status:** Planning Phase  
**Target:** Production-Ready SaaS Platform

---

## EXECUTIVE SUMMARY

### Current State
- **Core Infrastructure**: ✅ Solid (Next.js, Redux, RTK Query, MongoDB)
- **API Layer**: ✅ 80% Complete
- **UI Components**: ⚠️ 60% Complete  
- **Feature Implementation**: ⚠️ 50% Complete
- **Production Readiness**: ⚠️ 40%

### Critical Path Items
1. Complete Builder UI redesign (Section Library Modal + Toolbars)
2. Verify all CRUD operations end-to-end
3. Implement missing workflows (Orders, Reviews, etc.)
4. Add comprehensive error handling
5. Database schema verification
6. End-to-end testing

---

## PHASE 1: BUILDER REDESIGN (Week 1) 🔴 CRITICAL

### Objective
Transform Builder UX to match Shopify/Webflow/Framer standards

### Deliverables

#### 1. Section Library Modal
**File**: `/components/builder/section-library-modal.tsx`
- ✅ Redux state added
- ⏳ Create modal component with:
  - Full-screen responsive modal
  - Search bar with real-time filtering
  - Category sidebar navigation
  - Large section previews (3-column grid)
  - Section descriptions
  - Favorites toggle
  - Recently used section
  - Popular sections badge
  - "Add Section" button
  - Insert at position logic
- **Acceptance Criteria**:
  - Opens with Shift+A
  - Closes with ESC
  - Inserts section at correct position
  - Updates recently used list
  - Persists favorites to localStorage

#### 2. Floating Section Toolbar
**File**: `/components/builder/floating-section-toolbar.tsx`
- ⏳ Create floating toolbar with actions:
  - Move (Up/Down with disabled states)
  - Duplicate
  - Copy  
  - Paste (disabled when no clipboard)
  - Save as Template
  - Hide/Show toggle
  - Lock/Unlock toggle
  - Delete (with confirmation)
  - Settings (opens properties panel)
- **Positioning**: Float above selected section
- **Auto-hide**: Disappears when no selection
- **Responsive**: Adapts to small screens
- **Acceptance Criteria**:
  - Never blocks canvas content
  - Smooth show/hide animation
  - All actions work correctly
  - Keyboard shortcuts work (Cmd+D, Cmd+C, Cmd+V, Delete)

#### 3. Hover Quick Insert
**File**: `/components/builder/hover-section-insert.tsx`
- ⏳ Create hover zones between sections:
  - Show on hover between any two sections
  - Display floating "+" button
  - Click opens Section Library Modal
  - Pass insert position to modal
  - Smooth fade-in animation
- **Acceptance Criteria**:
  - Visible on hover only
  - Doesn't interfere with section selection
  - Correctly identifies insertion point
  - Works at top and bottom of page

#### 4. Keyboard Shortcuts
**File**: `/components/builder/builder-editor.tsx`
- ⏳ Implement shortcuts:
  - `Shift + A` → Open Section Library
  - `Ctrl/Cmd + K` → Command Palette (future)
  - `ESC` → Close modals
  - `Ctrl/Cmd + S` → Save (already exists ✅)
  - `Ctrl/Cmd + Z` → Undo (already exists ✅)
  - `Ctrl/Cmd + Shift + Z` → Redo (already exists ✅)
  - `Ctrl/Cmd + D` → Duplicate section (already exists ✅)
  - `Ctrl/Cmd + C` → Copy section (already exists ✅)
  - `Ctrl/Cmd + V` → Paste section (already exists ✅)
  - `Delete` → Delete section (already exists ✅)
- **Acceptance Criteria**:
  - Shortcuts don't conflict with browser defaults
  - Work across all builder views
  - Visual feedback for user

#### 5. Canvas & Sidebar Improvements
**Files**: `/components/builder/builder-editor.tsx`, `/components/builder/builder-sidebar.tsx`
- ⏳ Remove "Blocks" tab from left sidebar
- ⏳ Add "+ Add Section" button to toolbar
- ⏳ Ensure canvas always uses maximum width
- ⏳ Implement collapsible sidebars with resize handles (already exists ✅)
- ⏳ Add Desktop/Tablet/Mobile preview switcher
- **Acceptance Criteria**:
  - Canvas expands when sidebars collapse
  - Smooth transitions
  - Preview device switching functional

### Testing Checklist
- [ ] Section Library opens/closes correctly
- [ ] Search filters sections accurately
- [ ] Categories filter correctly
- [ ] Favorites persist across sessions
- [ ] Recently used updates correctly
- [ ] Insert position is accurate
- [ ] Floating toolbar appears on selection
- [ ] All toolbar actions work
- [ ] Hover insert shows between sections
- [ ] Keyboard shortcuts work
- [ ] Canvas resize smooth
- [ ] No layout breaking on mobile

**Estimated Time**: 3-4 days  
**Priority**: P0 (Blocking user requirement)

---

## PHASE 2: CRUD VERIFICATION (Week 1-2) 🟡 HIGH

### Objective
Verify every CRUD operation works end-to-end from UI → API → Database → UI refresh

### Areas to Verify

#### 1. Products (/products)
- [ ] **List**: Pagination, search, filtering, sorting
- [ ] **Create**: Form validation, image upload, variant creation
- [ ] **Read**: Product details load correctly
- [ ] **Update**: Changes persist, cache invalidates
- [ ] **Delete**: Soft delete, confirmation dialog
- [ ] **Duplicate**: Creates copy correctly
- [ ] **Bulk Actions**: Multi-select, bulk update
- [ ] **Import/Export**: CSV import/export
- [ ] **Variants**: Add, edit, delete variants
- [ ] **Inventory**: Stock tracking updates

#### 2. Orders (/orders)
- [ ] **List**: Shows all orders with correct status
- [ ] **Details**: Full order information displayed
- [ ] **Status Update**: Workflow (pending → processing → shipped → delivered)
- [ ] **Payment Status**: Mark as paid/unpaid
- [ ] **Refund**: Process refund, update inventory
- [ ] **Invoice**: Generate and download PDF
- [ ] **Print**: Order receipt printable
- [ ] **Search**: By order #, customer, product
- [ ] **Filter**: By status, date, payment status

#### 3. Customers (/customers)
- [ ] **List**: All customers with stats
- [ ] **Create**: Admin can create customer account
- [ ] **Details**: Customer profile with order history
- [ ] **Update**: Edit customer information
- [ ] **Delete**: Delete or deactivate customer
- [ ] **Orders**: View customer's order history
- [ ] **Search**: By name, email, phone

#### 4. Categories (/categories)
- [ ] **List**: All categories displayed
- [ ] **Create**: With image, description, SEO
- [ ] **Update**: Changes persist
- [ ] **Delete**: With warning if has products
- [ ] **Reorder**: Drag & drop position changes
- [ ] **Nested**: Parent-child relationships work

#### 5. Inventory (/inventory)
- [ ] **List**: Stock levels for all products
- [ ] **Update**: Stock quantity changes
- [ ] **Low Stock Alert**: Threshold warnings
- [ ] **History**: Track stock changes over time
- [ ] **Bulk Update**: Multi-product stock updates

#### 6. Coupons (/coupons)
- [ ] **List**: All coupons with status
- [ ] **Create**: Percentage, fixed, free shipping
- [ ] **Update**: Modify coupon rules
- [ ] **Delete**: Deactivate coupon
- [ ] **Usage Tracking**: Track redemptions
- [ ] **Expiration**: Auto-disable expired coupons

#### 7. Reviews (/reviews)
- [ ] **List**: All product reviews
- [ ] **Approve/Reject**: Moderation workflow
- [ ] **Delete**: Remove inappropriate reviews
- [ ] **Respond**: Store owner response
- [ ] **Filter**: By status, rating, product

#### 8. Pages (/pages)
- [ ] **List**: Builder pages
- [ ] **Create**: New page with sections
- [ ] **Update**: Edit sections, SEO
- [ ] **Delete**: With confirmation
- [ ] **Duplicate**: Copy page
- [ ] **Publish/Draft**: Status management

#### 9. CMS Pages (/cms)
- [ ] **List**: Static pages (About, Terms, Privacy, FAQ)
- [ ] **Create**: New CMS page
- [ ] **Update**: Rich text editor
- [ ] **Delete**: Remove page
- [ ] **SEO**: Per-page meta tags

#### 10. Media (/media)
- [ ] **Upload**: Single and multi-file
- [ ] **Delete**: Remove files
- [ ] **Rename**: Change filename
- [ ] **Folders**: Create, rename, delete folders
- [ ] **Search**: Find files by name
- [ ] **Pagination**: Large libraries
- [ ] **Storage**: Quota enforcement

#### 11. Navigation (/settings or separate)
- [ ] **List**: All menus
- [ ] **Create**: New menu
- [ ] **Add Items**: Page, product, category, external links
- [ ] **Nested**: Sub-menus
- [ ] **Reorder**: Drag & drop
- [ ] **Delete**: Remove menu items

#### 12. Theme (/appearance or /theme)
- [ ] **Colors**: Primary, secondary colors apply
- [ ] **Fonts**: Font selection works
- [ ] **Button Styles**: Styles apply to storefront
- [ ] **Layout**: Width settings work
- [ ] **Dark Mode**: Toggle works
- [ ] **Navbar**: Style selection applies
- [ ] **Live Preview**: Changes reflect immediately

#### 13. Settings (/settings)
- [ ] **Store Info**: Name, description update
- [ ] **Currency**: Changes apply to pricing
- [ ] **Localization**: Language, timezone
- [ ] **Tax**: Tax rate calculations
- [ ] **SEO**: Meta tags apply
- [ ] **Branding**: Logo, favicon upload
- [ ] **Domain**: Custom domain setup

### Testing Process
For each area:
1. Open page in browser
2. Test CREATE operation
3. Verify database record created (check DB)
4. Test READ operation (refresh page, see if data loads)
5. Test UPDATE operation
6. Verify changes in database
7. Test DELETE operation
8. Verify soft delete or hard delete as expected
9. Check Redux cache invalidation
10. Verify UI updates without manual refresh

**Estimated Time**: 5-7 days  
**Priority**: P1 (Core functionality)

---

## PHASE 3: ERROR HANDLING & UX POLISH (Week 2-3) 🟢 MEDIUM

### 1. Loading States
Implement consistent loading skeletons for:
- [ ] Product list
- [ ] Order list
- [ ] Customer list
- [ ] Category list
- [ ] Dashboard stats
- [ ] Analytics charts
- [ ] Media library
- [ ] Builder sections

### 2. Empty States
Design and implement for:
- [ ] No products
- [ ] No orders
- [ ] No customers
- [ ] No categories
- [ ] No media files
- [ ] No coupons
- [ ] No reviews
- [ ] No pages

### 3. Error States
Implement error handling for:
- [ ] Network errors
- [ ] 404 Not Found
- [ ] 500 Server Error
- [ ] 403 Forbidden
- [ ] Validation errors
- [ ] Upload errors
- [ ] Payment errors

### 4. Success Feedback
Add toast notifications for:
- [ ] Product created/updated/deleted
- [ ] Order status changed
- [ ] Customer created/updated
- [ ] Category created/updated
- [ ] Media uploaded/deleted
- [ ] Settings saved
- [ ] Theme updated
- [ ] Page published

### 5. Form Validation
Ensure validation for:
- [ ] Required fields highlighted
- [ ] Format validation (email, phone, URL)
- [ ] Unique constraint errors
- [ ] Min/max length
- [ ] Pattern matching (slug format)
- [ ] File type/size validation

**Estimated Time**: 3-4 days  
**Priority**: P2 (User experience)

---

## PHASE 4: BACKEND VERIFICATION (Week 3) 🟢 MEDIUM

### MongoDB Schema Audit
For each model, verify:
1. All fields defined in Mongoose schema
2. Indexes created for performance
3. Validation rules enforced
4. Default values set
5. Timestamps enabled
6. Soft delete support (if applicable)
7. Relationships properly defined

### Models to Verify
- [ ] Store
- [ ] Product
- [ ] ProductVariant
- [ ] Order
- [ ] OrderItem
- [ ] Customer
- [ ] Category
- [ ] Page
- [ ] Section
- [ ] Media
- [ ] Navigation
- [ ] Coupon
- [ ] Review
- [ ] Settings
- [ ] Theme

### API Endpoint Audit
For each endpoint:
- [ ] Authentication middleware
- [ ] Authorization (store ownership check)
- [ ] Input validation
- [ ] Error handling
- [ ] Proper HTTP status codes
- [ ] Pagination support
- [ ] Search/filter support
- [ ] Sort support

**Estimated Time**: 2-3 days  
**Priority**: P2 (Data integrity)

---

## PHASE 5: TESTING & QA (Week 4) ⚪ LOW

### Manual Testing
- [ ] Complete user workflows
- [ ] Cross-browser testing
- [ ] Responsive design testing
- [ ] Accessibility testing
- [ ] Performance testing
- [ ] Security testing

### Automated Testing (Future)
- [ ] Unit tests for utilities
- [ ] Integration tests for APIs
- [ ] E2E tests for critical paths
- [ ] Component tests with React Testing Library

**Estimated Time**: 3-5 days  
**Priority**: P3 (Quality assurance)

---

## SUCCESS CRITERIA

### Builder
- [x] Can create, edit, delete sections
- [x] Auto-save works
- [x] Undo/redo works
- [ ] Section Library Modal functional
- [ ] Floating toolbar functional
- [ ] Hover insert functional
- [ ] Keyboard shortcuts work
- [ ] Responsive preview works

### Dashboard
- [ ] All CRUD operations verified
- [ ] No API errors on page load
- [ ] No "Store not found" errors
- [ ] Loading states everywhere
- [ ] Empty states everywhere
- [ ] Error handling consistent
- [ ] Toast notifications consistent

### Data Integrity
- [ ] All database operations verified
- [ ] No orphaned records
- [ ] Relationships maintained
- [ ] Soft deletes working
- [ ] Audit logs capture changes

### Performance
- [ ] Page load < 3s
- [ ] API response < 500ms
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Code split effectively

### User Experience
- [ ] Intuitive navigation
- [ ] Clear feedback on actions
- [ ] Helpful error messages
- [ ] Responsive on all devices
- [ ] Accessible (WCAG 2.1 AA)

---

## TIMELINE

- **Week 1**: Builder redesign (Phase 1)
- **Week 2**: CRUD verification (Phase 2)
- **Week 3**: Error handling + Backend audit (Phase 3 & 4)
- **Week 4**: Testing & QA (Phase 5)

**Total Estimated Time**: 4 weeks for production readiness

---

## NEXT IMMEDIATE ACTIONS

1. ✅ Fix Builder API skip conditions (DONE)
2. ⏳ Create Section Library Modal component
3. ⏳ Create Floating Toolbar component
4. ⏳ Create Hover Insert component
5. ⏳ Test Builder end-to-end
6. ⏳ Begin CRUD verification starting with Products

---

**Updated:** 2026-07-14  
**Review Date:** Weekly  
**Owner:** Development Team
