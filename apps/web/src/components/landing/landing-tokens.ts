export const BRAND_COLORS = {
  bgWarm: "bg-[#FAFAFA]",
  bgWhite: "bg-white",
  textPrimary: "text-zinc-950",
  textSecondary: "text-zinc-500",
  textMuted: "text-zinc-400",
  borderSubtle: "border-zinc-200/80",
  accentBlue: "#2563EB",
  accentBlueHover: "#1D4ED8",
  accentEmerald: "#059669",
  accentAmber: "#D97706",
  accentPurple: "#7C3AED",
};

export const REVENUE_DATA: Record<string, Array<{ name: string; revenue: number; orders: number }>> = {
  Today: [
    { name: "09:00", revenue: 12400, orders: 8 },
    { name: "11:00", revenue: 24800, orders: 16 },
    { name: "13:00", revenue: 41200, orders: 28 },
    { name: "15:00", revenue: 68500, orders: 46 },
    { name: "17:00", revenue: 94200, orders: 64 },
    { name: "19:00", revenue: 118000, orders: 82 },
    { name: "21:00", revenue: 124800, orders: 94 },
  ],
  "7D": [
    { name: "Mon", revenue: 84000, orders: 62 },
    { name: "Tue", revenue: 112000, orders: 78 },
    { name: "Wed", revenue: 98000, orders: 71 },
    { name: "Thu", revenue: 146000, orders: 104 },
    { name: "Fri", revenue: 182000, orders: 128 },
    { name: "Sat", revenue: 210000, orders: 145 },
    { name: "Sun", revenue: 195000, orders: 136 },
  ],
  "30D": [
    { name: "Week 1", revenue: 420000, orders: 310 },
    { name: "Week 2", revenue: 580000, orders: 420 },
    { name: "Week 3", revenue: 740000, orders: 512 },
    { name: "Week 4", revenue: 910000, orders: 640 },
  ],
  "90D": [
    { name: "Month 1", revenue: 1650000, orders: 1180 },
    { name: "Month 2", revenue: 2240000, orders: 1590 },
    { name: "Month 3", revenue: 2890000, orders: 2040 },
  ],
};
