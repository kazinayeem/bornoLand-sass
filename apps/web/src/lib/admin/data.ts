export const stats = {
  totalUsers: 2847,
  totalTenants: 186,
  revenue: 84720,
  activeSubscriptions: 142,
  publishedSites: 523,
  monthlyGrowth: 12.5,
  userGrowth: 8.3,
  revenueGrowth: 23.1,
  tenantGrowth: 15.7
};

export const revenueData = [
  { month: "Jan", revenue: 4200, subscriptions: 2800, oneTime: 1400 },
  { month: "Feb", revenue: 5100, subscriptions: 3400, oneTime: 1700 },
  { month: "Mar", revenue: 4800, subscriptions: 3200, oneTime: 1600 },
  { month: "Apr", revenue: 5900, subscriptions: 3900, oneTime: 2000 },
  { month: "May", revenue: 6300, subscriptions: 4200, oneTime: 2100 },
  { month: "Jun", revenue: 5800, subscriptions: 3800, oneTime: 2000 },
  { month: "Jul", revenue: 7200, subscriptions: 4800, oneTime: 2400 },
  { month: "Aug", revenue: 8100, subscriptions: 5400, oneTime: 2700 },
  { month: "Sep", revenue: 7800, subscriptions: 5200, oneTime: 2600 },
  { month: "Oct", revenue: 8600, subscriptions: 5700, oneTime: 2900 },
  { month: "Nov", revenue: 8200, subscriptions: 5500, oneTime: 2700 },
  { month: "Dec", revenue: 9400, subscriptions: 6300, oneTime: 3100 }
];

export const userGrowthData = [
  { month: "Jan", users: 1200, active: 890 },
  { month: "Feb", users: 1350, active: 1020 },
  { month: "Mar", users: 1480, active: 1150 },
  { month: "Apr", users: 1620, active: 1280 },
  { month: "May", users: 1790, active: 1410 },
  { month: "Jun", users: 1950, active: 1550 },
  { month: "Jul", users: 2100, active: 1680 },
  { month: "Aug", users: 2280, active: 1820 },
  { month: "Sep", users: 2450, active: 1960 },
  { month: "Oct", users: 2600, active: 2100 },
  { month: "Nov", users: 2720, active: 2230 },
  { month: "Dec", users: 2847, active: 2350 }
];

export const tenantGrowthData = [
  { month: "Jan", tenants: 45, new: 8 },
  { month: "Feb", tenants: 52, new: 7 },
  { month: "Mar", tenants: 58, new: 6 },
  { month: "Apr", tenants: 67, new: 9 },
  { month: "May", tenants: 73, new: 6 },
  { month: "Jun", tenants: 82, new: 9 },
  { month: "Jul", tenants: 90, new: 8 },
  { month: "Aug", tenants: 98, new: 8 },
  { month: "Sep", tenants: 108, new: 10 },
  { month: "Oct", tenants: 120, new: 12 },
  { month: "Nov", tenants: 145, new: 25 },
  { month: "Dec", tenants: 186, new: 41 }
];

export const planDistribution = [
  { name: "Free", value: 45, color: "#94a3b8" },
  { name: "Starter", value: 68, color: "#60a5fa" },
  { name: "Growth", value: 42, color: "#2563eb" },
  { name: "Enterprise", value: 31, color: "#1d4ed8" }
];

export const recentActivity = [
  { id: 1, user: "Sarah Chen", action: "created a new tenant", target: "Acme Corp", time: "2 minutes ago", type: "create" },
  { id: 2, user: "Mike Johnson", action: "upgraded subscription to", target: "Growth Plan", time: "15 minutes ago", type: "upgrade" },
  { id: 3, user: "Emily Rodriguez", action: "published site", target: "landing.acmecorp.com", time: "1 hour ago", type: "publish" },
  { id: 4, user: "David Kim", action: "added team member to", target: "TechStartup.io", time: "3 hours ago", type: "team" },
  { id: 5, user: "Lisa Wang", action: "generated landing page with AI for", target: "GreenEnergy Co", time: "5 hours ago", type: "ai" },
  { id: 6, user: "James Wilson", action: "exported analytics for", target: "Q4 Dashboard", time: "1 day ago", type: "export" },
  { id: 7, user: "Anna Martinez", action: "customized template", target: "SaaS Hero", time: "1 day ago", type: "template" },
  { id: 8, user: "Tom Anderson", action: "paid invoice", target: "INV-2024-0891", time: "2 days ago", type: "payment" }
];

export const users = Array.from({ length: 50 }, (_, i) => ({
  id: `USR-${String(1000 + i).padStart(4, "0")}`,
  name: ["Alice Johnson", "Bob Smith", "Carol White", "David Brown", "Eva Martinez", "Frank Lee", "Grace Kim", "Henry Davis", "Ivy Chen", "Jack Wilson"][i % 10],
  email: ["alice@example.com", "bob@example.com", "carol@example.com", "david@example.com", "eva@example.com", "frank@example.com", "grace@example.com", "henry@example.com", "ivy@example.com", "jack@example.com"][i % 10],
  role: (["super_admin", "admin", "editor", "analyst", "viewer"] as const)[i % 5],
  status: (["active", "active", "active", "suspended", "active", "active", "invited", "active", "active", "banned"] as const)[i % 10],
  tenant: ["Acme Corp", "TechStartup.io", "GreenEnergy Co", "DataFlow Inc", "CloudBase", "PixelPerfect", "NovaWorks", "StreamLine", "Quantum Labs", "BrightPath"][i % 10],
  joined: new Date(2024, 0, i + 1).toISOString().split("T")[0],
  lastLogin: new Date(2025, 11, 20 - (i % 20)).toISOString().split("T")[0]
}));

export const tenants = Array.from({ length: 20 }, (_, i) => ({
  id: `TNT-${String(500 + i).padStart(4, "0")}`,
  name: ["Acme Corporation", "TechStartup.io", "GreenEnergy Co", "DataFlow Inc", "CloudBase Systems", "PixelPerfect Studio", "NovaWorks Labs", "StreamLine Media", "Quantum Research", "BrightPath Education", "MetalWorks GmbH", "SoftPixel Games", "EcoVation Hub", "UrbanNest Properties", "HealthFirst Clinic", "FinBridge Capital", "AeroSpace Dynamics", "OceanView Resorts", "CodeCraft Academy", "VitalSign Health"][i],
  slug: ["acme-corp", "techstartup", "greenenergy", "dataflow", "cloudbase", "pixelperfect", "novaworks", "streamline", "quantum", "brightpath", "metalworks", "softpixel", "ecovation", "urbannest", "healthfirst", "finbridge", "aerospace", "oceanview", "codecraft", "vitalsign"][i],
  plan: (["free", "starter", "growth", "enterprise"] as const)[i % 4],
  status: (["active", "active", "active", "trialing", "active", "active", "suspended", "active", "active", "active"] as const)[i % 10],
  users: Math.floor(Math.random() * 50) + 5,
  sites: Math.floor(Math.random() * 20) + 1,
  revenue: Math.floor(Math.random() * 5000) + 500,
  created: new Date(2024, i > 10 ? 5 : 0, i + 1).toISOString().split("T")[0],
  domain: `${["acme-corp", "techstartup", "greenenergy", "dataflow", "cloudbase", "pixelperfect", "novaworks", "streamline", "quantum", "brightpath", "metalworks", "softpixel", "ecovation", "urbannest", "healthfirst", "finbridge", "aerospace", "oceanview", "codecraft", "vitalsign"][i]}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bornosoftnr.site"}`
}));

export const subscriptions = [
  { id: "SUB-001", tenant: "Acme Corporation", plan: "Enterprise", status: "active", amount: 499, billing: "annual", nextBilling: "2026-06-15", started: "2024-01-15" },
  { id: "SUB-002", tenant: "TechStartup.io", plan: "Growth", status: "active", amount: 199, billing: "monthly", nextBilling: "2026-01-20", started: "2024-03-20" },
  { id: "SUB-003", tenant: "GreenEnergy Co", plan: "Starter", status: "active", amount: 49, billing: "monthly", nextBilling: "2026-02-05", started: "2024-06-05" },
  { id: "SUB-004", tenant: "DataFlow Inc", plan: "Enterprise", status: "trialing", amount: 0, billing: "monthly", nextBilling: "2026-02-15", started: "2025-01-15" },
  { id: "SUB-005", tenant: "CloudBase Systems", plan: "Growth", status: "active", amount: 199, billing: "annual", nextBilling: "2026-04-10", started: "2024-04-10" },
  { id: "SUB-006", tenant: "PixelPerfect Studio", plan: "Starter", status: "active", amount: 49, billing: "monthly", nextBilling: "2026-02-01", started: "2024-08-01" },
  { id: "SUB-007", tenant: "NovaWorks Labs", plan: "Free", status: "active", amount: 0, billing: "monthly", nextBilling: null, started: "2024-11-20" },
  { id: "SUB-008", tenant: "StreamLine Media", plan: "Growth", status: "past_due", amount: 199, billing: "monthly", nextBilling: "2026-01-25", started: "2024-09-25" }
];

export const supportTickets = [
  { id: "TK-1001", subject: "Cannot connect custom domain", tenant: "Acme Corporation", priority: "high", status: "open", assignee: "Support Team", created: "2026-01-02", updated: "2026-01-03" },
  { id: "TK-1002", subject: "Billing invoice discrepancy", tenant: "TechStartup.io", priority: "medium", status: "in_progress", assignee: "Billing Team", created: "2026-01-01", updated: "2026-01-03" },
  { id: "TK-1003", subject: "AI template generation failing", tenant: "GreenEnergy Co", priority: "high", status: "open", assignee: "Engineering", created: "2026-01-03", updated: "2026-01-03" },
  { id: "TK-1004", subject: "Need API key reset", tenant: "DataFlow Inc", priority: "low", status: "resolved", assignee: "Support Team", created: "2025-12-28", updated: "2026-01-02" },
  { id: "TK-1005", subject: "Team member invitation not sending", tenant: "CloudBase Systems", priority: "medium", status: "open", assignee: "Support Team", created: "2026-01-02", updated: "2026-01-02" }
];

export const pageViewsData = [
  { day: "Mon", views: 12400, unique: 8900 },
  { day: "Tue", views: 13800, unique: 9600 },
  { day: "Wed", views: 15200, unique: 11200 },
  { day: "Thu", views: 14800, unique: 10500 },
  { day: "Fri", views: 13500, unique: 9800 },
  { day: "Sat", views: 11200, unique: 7800 },
  { day: "Sun", views: 10800, unique: 7500 }
];

export interface User {
  id: string; name: string; email: string; role: string; status: string; tenant: string; joined: string; lastLogin: string;
}
export interface Tenant {
  id: string; name: string; slug: string; plan: string; status: string; users: number; sites: number; revenue: number; created: string; domain: string;
}
export interface Subscription {
  id: string; tenant: string; plan: string; status: string; amount: number; billing: string; nextBilling: string | null; started: string;
}
export interface Ticket {
  id: string; subject: string; tenant: string; priority: string; status: string; assignee: string; created: string; updated: string;
}
