import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { StoreEmailTemplateModel } from "./store-email-template.model.js";
import { updateEmailTemplateSchema } from "./store-email-template.validator.js";

const DEFAULT_TEMPLATES: Array<{ name: string; subject: string; body: string; variables: string[]; description: string }> = [
  { name: "welcome_email", subject: "Welcome to {{store.name}}!", body: "<h1>Welcome {{customer.name}}!</h1><p>Thank you for joining {{store.name}}. We're excited to have you.</p>", variables: ["customer.name", "customer.email", "store.name", "store.logo"], description: "Sent when a customer registers" },
  { name: "email_verification", subject: "Verify your email address", body: "<h1>Verify your email</h1><p>Click the link below to verify your email address:</p><p><a href='{{verification.url}}'>Verify Email</a></p>", variables: ["customer.name", "customer.email", "verification.url", "store.name"], description: "Sent for email verification" },
  { name: "password_reset", subject: "Reset your password", body: "<h1>Reset your password</h1><p>Click the link below to reset your password:</p><p><a href='{{reset.url}}'>Reset Password</a></p>", variables: ["customer.name", "customer.email", "reset.url", "store.name"], description: "Sent for password reset requests" },
  { name: "order_confirmation", subject: "Order #{{order.number}} confirmed", body: "<h1>Thank you for your order!</h1><p>Your order #{{order.number}} has been confirmed.</p><p>Total: {{order.total}}</p>", variables: ["customer.name", "customer.email", "order.number", "order.total", "order.status", "store.name"], description: "Sent when an order is placed" },
  { name: "order_paid", subject: "Payment received for order #{{order.number}}", body: "<h1>Payment Received</h1><p>We've received your payment of {{order.total}} for order #{{order.number}}.</p>", variables: ["customer.name", "order.number", "order.total", "payment.method", "payment.status", "store.name"], description: "Sent when payment is completed" },
  { name: "payment_failed", subject: "Payment failed for order #{{order.number}}", body: "<h1>Payment Failed</h1><p>The payment for order #{{order.number}} has failed. Please try again.</p>", variables: ["customer.name", "customer.email", "order.number", "order.total", "payment.method", "store.name"], description: "Sent when payment fails" },
  { name: "order_processing", subject: "Order #{{order.number}} is being processed", body: "<h1>Order Processing</h1><p>Your order #{{order.number}} is now being processed.</p>", variables: ["customer.name", "order.number", "order.status", "store.name"], description: "Sent when order starts processing" },
  { name: "order_shipped", subject: "Order #{{order.number}} has been shipped!", body: "<h1>Shipped!</h1><p>Your order #{{order.number}} has been shipped.</p><p>Tracking: {{tracking.number}}</p><p><a href='{{tracking.url}}'>Track your order</a></p>", variables: ["customer.name", "order.number", "tracking.number", "tracking.url", "store.name"], description: "Sent when order is shipped" },
  { name: "out_for_delivery", subject: "Order #{{order.number}} is out for delivery", body: "<h1>Out for Delivery</h1><p>Your order #{{order.number}} is out for delivery today.</p>", variables: ["customer.name", "order.number", "store.name"], description: "Sent when order is out for delivery" },
  { name: "delivered", subject: "Order #{{order.number}} has been delivered", body: "<h1>Delivered!</h1><p>Your order #{{order.number}} has been delivered. Enjoy!</p>", variables: ["customer.name", "order.number", "store.name"], description: "Sent when order is delivered" },
  { name: "cancelled", subject: "Order #{{order.number}} has been cancelled", body: "<h1>Order Cancelled</h1><p>Your order #{{order.number}} has been cancelled as requested.</p>", variables: ["customer.name", "order.number", "order.status", "store.name"], description: "Sent when order is cancelled" },
  { name: "refund_initiated", subject: "Refund initiated for order #{{order.number}}", body: "<h1>Refund Initiated</h1><p>A refund has been initiated for your order #{{order.number}}.</p>", variables: ["customer.name", "order.number", "order.total", "store.name"], description: "Sent when refund is initiated" },
  { name: "refund_completed", subject: "Refund completed for order #{{order.number}}", body: "<h1>Refund Completed</h1><p>Your refund of {{order.total}} for order #{{order.number}} has been completed.</p>", variables: ["customer.name", "order.number", "order.total", "store.name"], description: "Sent when refund is completed" },
  { name: "invoice", subject: "Invoice for order #{{order.number}}", body: "<h1>Invoice</h1><p>Your invoice for order #{{order.number}} is ready.</p><p><a href='{{invoice.url}}'>View Invoice</a></p>", variables: ["customer.name", "order.number", "order.total", "invoice.url", "store.name", "store.address"], description: "Sent when invoice is generated" },
  { name: "abandoned_cart", subject: "You left something in your cart", body: "<h1>Complete your order</h1><p>You have items waiting in your cart. Complete your purchase now!</p>", variables: ["customer.name", "customer.email", "store.name"], description: "Sent for abandoned cart reminders" },
  { name: "wishlist_reminder", subject: "Items in your wishlist are available", body: "<h1>Wishlist Update</h1><p>Some items in your wishlist are now available or on sale.</p>", variables: ["customer.name", "customer.email", "store.name"], description: "Sent for wishlist reminders" },
  { name: "review_request", subject: "How was your experience?", body: "<h1>We'd love your feedback</h1><p>Please take a moment to review your recent purchase.</p>", variables: ["customer.name", "order.number", "store.name"], description: "Sent to request reviews" },
  { name: "contact_form", subject: "New contact message", body: "<h1>New Message</h1><p>You have received a new message from {{customer.name}} ({{customer.email}}).</p>", variables: ["customer.name", "customer.email", "store.name", "store.email"], description: "Sent when a contact form is submitted" },
  { name: "support_reply", subject: "Reply to your support ticket", body: "<h1>Support Update</h1><p>Your support ticket has received a reply.</p>", variables: ["customer.name", "customer.email", "store.name"], description: "Sent when support replies" },
  { name: "subscription_renewal", subject: "Your subscription is renewing", body: "<h1>Subscription Renewal</h1><p>Your subscription with {{store.name}} is up for renewal.</p>", variables: ["customer.name", "customer.email", "store.name"], description: "Sent for subscription renewals" },
  { name: "store_announcement", subject: "Announcement from {{store.name}}", body: "<h1>{{store.name}}</h1><p>{{announcement.message}}</p>", variables: ["store.name", "store.logo", "announcement.message", "store.email", "store.phone"], description: "Sent for store announcements" },
  { name: "low_stock_alert", subject: "Low stock alert: {{product.name}}", body: "<h1>Low Stock Alert</h1><p>The product {{product.name}} is running low on stock.</p>", variables: ["product.name", "product.sku", "store.name"], description: "Alert for low stock" },
  { name: "staff_invitation", subject: "You've been invited to join {{store.name}}", body: "<h1>Staff Invitation</h1><p>You have been invited to join {{store.name}} as a staff member.</p>", variables: ["customer.name", "customer.email", "store.name", "invitation.url"], description: "Sent for staff invitations" },
  { name: "custom_event", subject: "{{event.subject}}", body: "<h1>{{event.title}}</h1><p>{{event.message}}</p>", variables: ["event.subject", "event.title", "event.message", "store.name"], description: "Custom event notification" },
];

export async function ensureDefaultEmailTemplates(storeId: string) {
  await connectDatabase();
  const existing = await StoreEmailTemplateModel.countDocuments({ storeId }).lean();
  if (existing > 0) return;

  const templates = DEFAULT_TEMPLATES.map((t) => ({
    storeId,
    ...t,
    isDefault: true,
  }));

  await StoreEmailTemplateModel.insertMany(templates);
}

export async function getEmailTemplates(storeId: string, userId?: string) {
  await connectDatabase();
  if (userId) {
    const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
    if (!store) return { ok: false as const, message: "Store not found" };
  }
  const templates = await StoreEmailTemplateModel.find({ storeId }).sort({ name: 1 }).lean();
  return { ok: true as const, data: { templates } };
}

export async function getEmailTemplate(storeId: string, templateId: string, userId?: string) {
  await connectDatabase();
  if (userId) {
    const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
    if (!store) return { ok: false as const, message: "Store not found" };
  }
  const template = await StoreEmailTemplateModel.findOne({ _id: templateId, storeId }).lean() as Record<string, unknown> | null;
  if (!template) return { ok: false as const, message: "Template not found" };
  return { ok: true as const, data: { template } };
}

export async function updateEmailTemplate(storeId: string, templateId: string, userId: string, payload: unknown) {
  const parsed = updateEmailTemplateSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid template data" };

  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const template = await StoreEmailTemplateModel.findOneAndUpdate(
    { _id: templateId, storeId },
    { $set: { ...parsed.data, isDefault: false } },
    { new: true, runValidators: true },
  ).lean() as Record<string, unknown> | null;

  if (!template) return { ok: false as const, message: "Template not found" };
  return { ok: true as const, data: { template } };
}

export async function resetEmailTemplate(storeId: string, templateId: string, userId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const template = await StoreEmailTemplateModel.findOne({ _id: templateId, storeId }).lean() as Record<string, unknown> | null;
  if (!template) return { ok: false as const, message: "Template not found" };

  const templateName = template.name as string;
  const defaultTemplate = DEFAULT_TEMPLATES.find((t) => t.name === templateName);
  if (!defaultTemplate) return { ok: false as const, message: "No default template found" };

  const reset = await StoreEmailTemplateModel.findOneAndUpdate(
    { _id: templateId, storeId },
    { $set: { subject: defaultTemplate.subject, body: defaultTemplate.body, variables: defaultTemplate.variables, description: defaultTemplate.description, isDefault: true } },
    { new: true },
  ).lean() as Record<string, unknown> | null;

  return { ok: true as const, data: { template: reset } };
}

export async function duplicateEmailTemplate(storeId: string, templateId: string, userId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const source = await StoreEmailTemplateModel.findOne({ _id: templateId, storeId }).lean() as Record<string, unknown> | null;
  if (!source) return { ok: false as const, message: "Template not found" };

  const dupName = `${source.name as string}_copy`;
  const duplicate = await StoreEmailTemplateModel.create({
    storeId,
    name: dupName,
    subject: source.subject as string,
    body: source.body as string,
    variables: source.variables as string[],
    description: (source.description as string) ?? "",
    isDefault: false,
  });

  return { ok: true as const, data: { template: duplicate.toObject() } };
}

export async function getTemplateByName(storeId: string, name: string) {
  await connectDatabase();
  return StoreEmailTemplateModel.findOne({ storeId, name }).lean() as Promise<Record<string, unknown> | null>;
}
