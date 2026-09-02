import type { Request, Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import {
  listAccounts,
  createAccount,
  postJournalEntry,
  listJournalEntries,
  getFinancialStatements,
  listExpenses,
  createExpense,
} from "./accounting.service.js";

function storeIdOf(request: Request) {
  return String(request.params.storeId ?? "");
}

// ── Chart of Accounts ──
export async function listAccountsController(request: Request, response: Response) {
  try {
    const accounts = await listAccounts(storeIdOf(request), request.query as any);
    response.json({ ok: true, data: { accounts } });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to list accounts" });
  }
}

export async function createAccountController(request: Request, response: Response) {
  try {
    const account = await createAccount(storeIdOf(request), request.body);
    response.status(201).json({ ok: true, data: account });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to create account" });
  }
}

// ── Double-Entry Journal ──
export async function postJournalEntryController(request: AuthRequest, response: Response) {
  try {
    const entry = await postJournalEntry(storeIdOf(request), {
      ...request.body,
      postedBy: request.user?.email || "Accountant",
    });
    response.status(201).json({ ok: true, data: entry });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to post journal entry" });
  }
}

export async function listJournalEntriesController(request: Request, response: Response) {
  try {
    const result = await listJournalEntries(storeIdOf(request), request.query as any);
    response.json({ ok: true, data: result });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to list journal entries" });
  }
}

// ── Financial Statements (P&L, Balance Sheet, Trial Balance) ──
export async function getFinancialStatementsController(request: Request, response: Response) {
  try {
    const statements = await getFinancialStatements(storeIdOf(request));
    response.json({ ok: true, data: statements });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to generate financial statements" });
  }
}

// ── Expenses ──
export async function listExpensesController(request: Request, response: Response) {
  try {
    const result = await listExpenses(storeIdOf(request), request.query as any);
    response.json({ ok: true, data: result });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to list expenses" });
  }
}

export async function createExpenseController(request: AuthRequest, response: Response) {
  try {
    const expense = await createExpense(storeIdOf(request), {
      ...request.body,
      recordedBy: request.user?.email || "Manager",
    });
    response.status(201).json({ ok: true, data: expense });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to record expense" });
  }
}
