import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { AccountModel } from "./account.model.js";
import { JournalEntryModel } from "./journal-entry.model.js";
import { ExpenseModel, ExpenseCategoryModel } from "./expense.model.js";

function oid(id: string | mongoose.Types.ObjectId | null | undefined): mongoose.Types.ObjectId | null {
  if (!id) return null;
  if (typeof id !== "string") return id as mongoose.Types.ObjectId;
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
}

function storeOid(storeId: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
  if (typeof storeId !== "string") return storeId as mongoose.Types.ObjectId;
  if (mongoose.Types.ObjectId.isValid(storeId) && String(new mongoose.Types.ObjectId(storeId)) === storeId) {
    return new mongoose.Types.ObjectId(storeId);
  }
  return new mongoose.Types.ObjectId("000000000000000000000000");
}

const DEFAULT_ACCOUNTS = [
  // Assets (1000s)
  { code: "1010", name: "Cash on Hand", type: "asset", isSystem: true, currentBalance: 0 },
  { code: "1020", name: "Bank Account (Operating)", type: "asset", isSystem: true, currentBalance: 0 },
  { code: "1030", name: "Mobile Financial Services (bKash/Nagad)", type: "asset", isSystem: true, currentBalance: 0 },
  { code: "1040", name: "Accounts Receivable", type: "asset", isSystem: true, currentBalance: 0 },
  { code: "1050", name: "Inventory Asset", type: "asset", isSystem: true, currentBalance: 0 },

  // Liabilities (2000s)
  { code: "2010", name: "Accounts Payable (Suppliers)", type: "liability", isSystem: true, currentBalance: 0 },
  { code: "2020", name: "Sales Tax / VAT Payable", type: "liability", isSystem: true, currentBalance: 0 },
  { code: "2030", name: "Accrued Salaries Payable", type: "liability", isSystem: true, currentBalance: 0 },

  // Equity (3000s)
  { code: "3010", name: "Owner Capital / Equity", type: "equity", isSystem: true, currentBalance: 0 },
  { code: "3020", name: "Retained Earnings", type: "equity", isSystem: true, currentBalance: 0 },

  // Revenue (4000s)
  { code: "4010", name: "E-Commerce Sales Revenue", type: "revenue", isSystem: true, currentBalance: 0 },
  { code: "4020", name: "POS Store Sales Revenue", type: "revenue", isSystem: true, currentBalance: 0 },
  { code: "4030", name: "Shipping & Delivery Income", type: "revenue", isSystem: true, currentBalance: 0 },

  // Expenses (5000s Cost of Sales & 6000s Operating)
  { code: "5010", name: "Cost of Goods Sold (COGS)", type: "expense", isSystem: true, currentBalance: 0 },
  { code: "5020", name: "Inventory Waste & Damage Loss", type: "expense", isSystem: true, currentBalance: 0 },
  { code: "6010", name: "Salaries & Wages Expense", type: "expense", isSystem: true, currentBalance: 0 },
  { code: "6020", name: "Rent & Utilities", type: "expense", isSystem: true, currentBalance: 0 },
  { code: "6030", name: "Packaging & Supplies", type: "expense", isSystem: true, currentBalance: 0 },
  { code: "6040", name: "Marketing & Advertising", type: "expense", isSystem: true, currentBalance: 0 },
  { code: "6050", name: "Delivery & Courier Fees", type: "expense", isSystem: true, currentBalance: 0 },
  { code: "6060", name: "Payment Gateway & Banking Fees", type: "expense", isSystem: true, currentBalance: 0 },
];

export async function ensureDefaultChartOfAccounts(storeId: string) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const count = await AccountModel.countDocuments({ storeId: sid });
  if (count > 0) return;

  const docs = DEFAULT_ACCOUNTS.map((a) => ({
    ...a,
    storeId: sid,
  }));
  await AccountModel.insertMany(docs);
}

// ── 1. Chart of Accounts ────────────────────────────────────────────────────

export async function listAccounts(storeId: string, query?: { type?: string }) {
  await connectDatabase();
  const sid = storeOid(storeId);
  await ensureDefaultChartOfAccounts(storeId);

  const filter: Record<string, any> = { storeId: sid, status: "active" };
  if (query?.type && query.type !== "all") filter.type = query.type;

  const accounts = await AccountModel.find(filter).sort({ code: 1 }).lean();
  return accounts;
}

export async function createAccount(storeId: string, payload: any) {
  await connectDatabase();
  const sid = storeOid(storeId);
  return AccountModel.create({
    ...payload,
    storeId: sid,
  });
}

// ── 2. Double-Entry Journal Engine ──────────────────────────────────────────

export async function postJournalEntry(
  storeId: string,
  payload: {
    entryNumber?: string;
    date?: Date;
    reference?: string;
    source?: string;
    lines: { accountId: string; debit: number; credit: number; description?: string }[];
    notes?: string;
    postedBy?: string;
  }
) {
  await connectDatabase();
  const sid = storeOid(storeId);

  const totalDebit = payload.lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = payload.lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(`Double-entry unbalance: Debits (৳${totalDebit}) != Credits (৳${totalCredit})`);
  }

  const count = await JournalEntryModel.countDocuments({ storeId: sid });
  const entryNumber = payload.entryNumber || `JE-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

  const entry = await JournalEntryModel.create({
    storeId: sid,
    entryNumber,
    date: payload.date || new Date(),
    reference: payload.reference || "",
    source: payload.source || "manual",
    lines: payload.lines.map((l) => ({
      accountId: oid(l.accountId),
      debit: Number(l.debit) || 0,
      credit: Number(l.credit) || 0,
      description: l.description || "",
    })),
    totalAmount: totalDebit,
    notes: payload.notes || "",
    postedBy: payload.postedBy || "system",
    status: "posted",
  });

  // Update real-time balances in Account master
  for (const line of payload.lines) {
    const acc = await AccountModel.findOne({ _id: oid(line.accountId), storeId: sid });
    if (!acc) continue;

    const debit = Number(line.debit) || 0;
    const credit = Number(line.credit) || 0;

    // Standard accounting equation:
    // Assets & Expenses increase on Debit, decrease on Credit
    // Liabilities, Equity, Revenue increase on Credit, decrease on Debit
    if (acc.type === "asset" || acc.type === "expense") {
      acc.currentBalance += debit - credit;
    } else {
      acc.currentBalance += credit - debit;
    }
    await acc.save();
  }

  return entry;
}

export async function listJournalEntries(
  storeId: string,
  query: { page?: number; limit?: number; source?: string }
) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = { storeId: sid };
  if (query.source && query.source !== "all") filter.source = query.source;

  const [entries, total] = await Promise.all([
    JournalEntryModel.find(filter)
      .populate("lines.accountId", "name code type")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    JournalEntryModel.countDocuments(filter),
  ]);

  return {
    entries,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── 3. Financial Statements: Trial Balance, P&L, Balance Sheet ───────────────

export async function getFinancialStatements(storeId: string) {
  await connectDatabase();
  const sid = storeOid(storeId);
  await ensureDefaultChartOfAccounts(storeId);

  const accounts = await AccountModel.find({ storeId: sid, status: "active" }).sort({ code: 1 }).lean();

  const assets = accounts.filter((a) => a.type === "asset");
  const liabilities = accounts.filter((a) => a.type === "liability");
  const equity = accounts.filter((a) => a.type === "equity");
  const revenues = accounts.filter((a) => a.type === "revenue");
  const expenses = accounts.filter((a) => a.type === "expense");

  const totalAssets = assets.reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const totalEquity = equity.reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const totalRevenue = revenues.reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const totalExpense = expenses.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  const netProfit = totalRevenue - totalExpense;

  return {
    trialBalance: accounts.map((a) => ({
      code: a.code,
      name: a.name,
      type: a.type,
      debit: a.type === "asset" || a.type === "expense" ? Math.max(0, a.currentBalance) : 0,
      credit: a.type === "liability" || a.type === "equity" || a.type === "revenue" ? Math.max(0, a.currentBalance) : 0,
    })),
    profitAndLoss: {
      revenues,
      expenses,
      totalRevenue,
      totalExpense,
      netProfit,
    },
    balanceSheet: {
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilities,
      totalEquity: totalEquity + netProfit, // equity includes retained earnings from net profit
    },
  };
}

// ── 4. Expense Tracker ──────────────────────────────────────────────────────

export async function listExpenses(
  storeId: string,
  query: { page?: number; limit?: number; category?: string; status?: string }
) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = { storeId: sid };
  if (query.category && query.category !== "all") filter.category = query.category;
  if (query.status && query.status !== "all") filter.paymentStatus = query.status;

  const [expenses, total, sumResult] = await Promise.all([
    ExpenseModel.find(filter).sort({ expenseDate: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    ExpenseModel.countDocuments(filter),
    ExpenseModel.aggregate([
      { $match: filter },
      { $group: { _id: null, totalSpent: { $sum: "$totalAmount" } } },
    ]),
  ]);

  return {
    expenses,
    total,
    totalSpent: sumResult[0]?.totalSpent || 0,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createExpense(storeId: string, payload: any) {
  await connectDatabase();
  const sid = storeOid(storeId);

  const count = await ExpenseModel.countDocuments({ storeId: sid });
  const expenseNumber = `EXP-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

  const amount = Number(payload.amount) || 0;
  const tax = Number(payload.taxAmount) || 0;
  const totalAmount = amount + tax;

  const expense = await ExpenseModel.create({
    ...payload,
    storeId: sid,
    expenseNumber,
    amount,
    taxAmount: tax,
    totalAmount,
    expenseDate: payload.expenseDate || new Date(),
  });

  // Automatically post double-entry journal if accounts are configured
  if (payload.paidFromAccountId && payload.expenseAccountId) {
    try {
      await postJournalEntry(storeId, {
        reference: expenseNumber,
        source: "expense",
        notes: `Expense: ${payload.title} (${payload.category})`,
        lines: [
          { accountId: payload.expenseAccountId, debit: totalAmount, credit: 0, description: payload.title },
          { accountId: payload.paidFromAccountId, debit: 0, credit: totalAmount, description: `Paid from ${payload.paymentMethod}` },
        ],
      });
    } catch (e) {
      console.warn("[Accounting] Auto expense journal post failed:", e);
    }
  }

  return expense;
}
