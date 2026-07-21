import { connectDatabase } from "../../common/database/connection.js";
import { CustomerModel } from "../../models/customer.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function getCustomerJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

export async function registerCustomer(storeId: string, payload: { name: string; email: string; password: string }) {
  await connectDatabase();

  const existing = await CustomerModel.findOne({ storeId, email: payload.email.toLowerCase() });
  if (existing) return { ok: false as const, message: "Email already registered" };

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const customer = await CustomerModel.create({
    storeId,
    name: payload.name,
    email: payload.email.toLowerCase(),
    passwordHash
  });

  const token = jwt.sign(
    { customerId: customer._id, storeId, email: customer.email },
    getCustomerJwtSecret(),
    { expiresIn: "7d" }
  );

  return {
    ok: true as const,
    data: {
      customer: { _id: customer._id, name: customer.name, email: customer.email, storeId: customer.storeId },
      token
    }
  };
}

export async function loginCustomer(storeId: string, payload: { email: string; password: string }) {
  await connectDatabase();

  const customer = await CustomerModel.findOne({ storeId, email: payload.email.toLowerCase() });
  if (!customer) return { ok: false as const, message: "Invalid email or password" };

  const valid = await bcrypt.compare(payload.password, customer.passwordHash);
  if (!valid) return { ok: false as const, message: "Invalid email or password" };

  await CustomerModel.updateOne({ _id: customer._id }, { lastLoginAt: new Date() });

  const token = jwt.sign(
    { customerId: customer._id, storeId, email: customer.email },
    getCustomerJwtSecret(),
    { expiresIn: "7d" }
  );

  return {
    ok: true as const,
    data: {
      customer: { _id: customer._id, name: customer.name, email: customer.email, storeId: customer.storeId },
      token
    }
  };
}

export async function getCustomerById(customerId: string) {
  await connectDatabase();
  const customer = await CustomerModel.findById(customerId).lean() as any;
  if (!customer) return { ok: false as const, message: "Customer not found" };
  const { passwordHash, ...rest } = customer;
  return { ok: true as const, data: { customer: rest } };
}

/**
 * Always returns success to avoid email enumeration.
 * When SMTP is configured, a reset link email can be wired here later.
 */
export async function requestCustomerPasswordReset(storeId: string, email: string) {
  await connectDatabase();
  const customer = await CustomerModel.findOne({ storeId, email: email.toLowerCase().trim() }).lean() as {
    _id: unknown;
    email: string;
  } | null;
  if (customer) {
    try {
      const { sendEmail } = await import("../../common/integrations/email.js");
      await sendEmail({
        to: customer.email,
        subject: "Password reset request",
        text: "We received a password reset request for your account. If you did not request this, you can ignore this email. Contact the store to complete a password reset.",
        html: "<p>We received a password reset request for your account.</p><p>If you did not request this, you can ignore this email. Contact the store to complete a password reset.</p>",
      });
    } catch {
      // Soft-fail — still return success to the client
    }
  }
  return {
    ok: true as const,
    data: {
      message: "If an account exists for that email, you will receive reset instructions shortly.",
    },
  };
}
