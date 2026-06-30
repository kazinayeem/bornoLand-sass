export const STORE_TRIAL_DAYS = 3;

export const STORE_TYPES = [
  { id: "ecommerce", label: "Ecommerce", description: "Sell products online with cart, checkout, and inventory.", enabled: true },
  { id: "portfolio", label: "Portfolio", description: "Showcase your work and creative projects.", enabled: false },
  { id: "lms", label: "LMS", description: "Courses, lessons, and student management.", enabled: false },
  { id: "agency", label: "Agency", description: "Client projects, case studies, and services.", enabled: false },
  { id: "restaurant", label: "Restaurant", description: "Menus, reservations, and online ordering.", enabled: false },
  { id: "booking", label: "Booking", description: "Appointments, schedules, and bookings.", enabled: false },
  { id: "digital_products", label: "Digital Products", description: "Downloads, licenses, and digital delivery.", enabled: false },
  { id: "real_estate", label: "Real Estate", description: "Property listings and lead capture.", enabled: false },
  { id: "blog", label: "Blog", description: "Articles, newsletters, and content publishing.", enabled: false },
  { id: "hospital", label: "Hospital", description: "Healthcare services and patient portals.", enabled: false },
  { id: "school", label: "School", description: "School websites, admissions, and announcements.", enabled: false },
  { id: "marketplace", label: "Marketplace", description: "Multi-vendor marketplace platform.", enabled: false },
] as const;

export type StoreTypeId = (typeof STORE_TYPES)[number]["id"];

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isTrialExpired(trialEndsAt?: Date | string | null) {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt).getTime() < Date.now();
}
