export const rolePermissions = {
  super_admin: ["platform:manage", "tenant:manage", "billing:manage", "templates:manage", "analytics:view"],
  admin: ["tenant:manage", "billing:view", "team:manage", "page:publish", "analytics:view"],
  editor: ["page:edit", "page:publish", "assets:upload"],
  viewer: ["page:view"]
} as const;

export type Permission = (typeof rolePermissions)[keyof typeof rolePermissions][number];
