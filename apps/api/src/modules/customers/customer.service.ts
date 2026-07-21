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

  const email = payload.email.toLowerCase().trim();
  const existing = await CustomerModel.findOne({ storeId, email });

  if (existing) {
    if (existing.isGuest) {
      const passwordHash = await bcrypt.hash(payload.password, 12);
      existing.name = payload.name;
      existing.passwordHash = passwordHash;
      existing.isGuest = false;
      existing.status = "active";
      existing.lastLoginAt = new Date();
      await existing.save();

      const token = jwt.sign(
        { customerId: existing._id, storeId, email: existing.email },
        getCustomerJwtSecret(),
        { expiresIn: "7d" }
      );

      return {
        ok: true as const,
        data: {
          customer: { _id: existing._id, name: existing.name, email: existing.email, storeId: existing.storeId },
          token
        }
      };
    }
    return { ok: false as const, message: "Email already registered" };
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const customer = await CustomerModel.create({
    storeId,
    name: payload.name,
    email,
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

export async function syncCustomerOrderStats(storeId: string, customerId: string) {
  const { OrderModel } = await import("../../models/order.model.js");
  const stats = await OrderModel.aggregate([
    { $match: { storeId: storeId as any, customerId: customerId as any } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$total" },
        lastOrderDate: { $max: "$createdAt" },
      },
    },
  ]);
  const s = stats[0] || { totalOrders: 0, totalSpent: 0, lastOrderDate: undefined };
  await CustomerModel.findByIdAndUpdate(customerId, {
    $set: {
      totalOrders: s.totalOrders,
      totalSpent: s.totalSpent,
      lastOrderDate: s.lastOrderDate || null,
      averageOrderValue: s.totalOrders > 0 ? Math.round((s.totalSpent / s.totalOrders) * 100) / 100 : 0,
    },
  });
}

export async function listStoreCustomers(storeId: string, options?: { search?: string; page?: number; limit?: number; status?: string }) {
  await connectDatabase();
  const search = options?.search;
  const page = Math.max(1, options?.page ?? 1);
  const limitNum = Math.min(100, Math.max(1, options?.limit ?? 20));
  const skip = (page - 1) * limitNum;

  const filter: Record<string, unknown> = { storeId };
  if (options?.status) filter.status = options.status;
  if (search) {
    const q = search.trim();
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
    ];
  }

  const [customers, total] = await Promise.all([
    CustomerModel.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    CustomerModel.countDocuments(filter),
  ]);

  return {
    ok: true as const,
    data: {
      customers,
      total,
      page,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

export async function getStoreCustomerDetail(storeId: string, customerId: string) {
  await connectDatabase();
  const { OrderModel } = await import("../../models/order.model.js");
  const { AddressModel } = await import("./address.model.js");

  const customer = await CustomerModel.findOne({ _id: customerId, storeId })
    .select("-passwordHash")
    .lean() as any;
  if (!customer) return { ok: false as const, message: "Customer not found" };

  const [orders, addresses] = await Promise.all([
    OrderModel.find({ storeId, customerId }).sort({ createdAt: -1 }).lean(),
    AddressModel.find({ storeId, customerId }).lean(),
  ]);

  return {
    ok: true as const,
    data: { customer: { ...customer, addresses }, orders },
  };
}

export async function updateStoreCustomer(
  storeId: string,
  customerId: string,
  payload: {
    name?: string;
    email?: string;
    phone?: string;
    status?: string;
    notes?: string;
    tags?: string[];
  }
) {
  await connectDatabase();
  const update: Record<string, unknown> = {};
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.email !== undefined) update.email = payload.email.toLowerCase().trim();
  if (payload.phone !== undefined) update.phone = payload.phone;
  if (payload.status !== undefined) update.status = payload.status;
  if (payload.notes !== undefined) update.notes = payload.notes;
  if (payload.tags !== undefined) update.tags = payload.tags;

  const customer = await CustomerModel.findOneAndUpdate(
    { _id: customerId, storeId },
    { $set: update },
    { new: true }
  ).select("-passwordHash").lean();

  if (!customer) return { ok: false as const, message: "Customer not found" };
  return { ok: true as const, data: { customer } };
}

export async function createGuestCustomer(storeId: string, email: string, name?: string) {
  await connectDatabase();
  const existing = await CustomerModel.findOne({ storeId, email: email.toLowerCase().trim() });
  if (existing) return { ok: true as const, data: { customer: existing }, created: false };

  const customer = await CustomerModel.create({
    storeId,
    name: name || email.split("@")[0],
    email: email.toLowerCase().trim(),
    passwordHash: "",
    isGuest: true,
  });

  return { ok: true as const, data: { customer }, created: true };
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
