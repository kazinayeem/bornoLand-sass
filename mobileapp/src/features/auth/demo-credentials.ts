export const DEMO_LOGINS = {
  user: {
    email: "demo@bornoland.com",
    password: "Demo@123",
    loginType: "user" as const,
  },
  admin: {
    email: "admin@bornoland.com",
    password: "Admin@123",
    loginType: "admin" as const,
  },
} as const;
