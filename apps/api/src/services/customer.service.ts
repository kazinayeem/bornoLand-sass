import { connectDatabase } from "../config/database.js";
import { CustomerModel } from "../models/customer.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "bornoland-customer-secret";

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
    JWT_SECRET,
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
    JWT_SECRET,
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
