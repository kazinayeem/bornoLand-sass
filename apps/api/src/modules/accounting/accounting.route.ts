import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  listAccountsController,
  createAccountController,
  postJournalEntryController,
  listJournalEntriesController,
  getFinancialStatementsController,
  listExpensesController,
  createExpenseController,
} from "./accounting.controller.js";

export const accountingRouter: Router = Router({ mergeParams: true });

const storeId = (req: { params: { storeId?: string } }) => String(req.params.storeId);
const accountingGuard = requireFeatureAccess("accounting", { getStoreId: storeId });
const expenseGuard = requireFeatureAccess("accounting", { getStoreId: storeId });

accountingRouter.use(requireAuth);

// Chart of Accounts
accountingRouter.get("/accounts", accountingGuard, listAccountsController);
accountingRouter.post("/accounts", accountingGuard, createAccountController);

// Double-Entry Journal
accountingRouter.get("/journal", accountingGuard, listJournalEntriesController);
accountingRouter.post("/journal", accountingGuard, postJournalEntryController);

// Financial Statements (Trial Balance, P&L, Balance Sheet)
accountingRouter.get("/statements", accountingGuard, getFinancialStatementsController);

// Expenses
accountingRouter.get("/expenses", expenseGuard, listExpensesController);
accountingRouter.post("/expenses", expenseGuard, createExpenseController);
