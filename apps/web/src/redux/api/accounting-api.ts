import { baseApi } from "@/redux/api/base-api";

export type Account = {
  _id: string;
  storeId: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  isSystem: boolean;
  currency: string;
  currentBalance: number;
  description?: string;
  status: string;
};

export type JournalLine = {
  accountId: Account;
  debit: number;
  credit: number;
  description?: string;
};

export type JournalEntry = {
  _id: string;
  storeId: string;
  entryNumber: string;
  date: string;
  reference?: string;
  source: string;
  lines: JournalLine[];
  totalAmount: number;
  notes?: string;
  postedBy: string;
  status: string;
  createdAt: string;
};

export type Expense = {
  _id: string;
  storeId: string;
  expenseNumber: string;
  category: string;
  title: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "overdue";
  expenseDate: string;
  vendor?: string;
  receiptUrl?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
};

export type FinancialStatements = {
  trialBalance: {
    code: string;
    name: string;
    type: string;
    debit: number;
    credit: number;
  }[];
  profitAndLoss: {
    revenues: Account[];
    expenses: Account[];
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
  };
  balanceSheet: {
    assets: Account[];
    liabilities: Account[];
    equity: Account[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
  };
};

export type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
  message?: string;
};

export const accountingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Accounts ──
    getAccounts: builder.query<ApiEnvelope<{ accounts: Account[] }>, { storeId: string; type?: string }>({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/accounting/accounts`,
        params,
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Accounting", id: `${storeId}-accounts` }],
    }),

    createAccount: builder.mutation<ApiEnvelope<Account>, { storeId: string; body: any }>({
      query: ({ storeId, body }) => ({
        url: `/stores/${storeId}/accounting/accounts`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Accounting", id: `${storeId}-accounts` }],
    }),

    // ── Journal Entries ──
    getJournalEntries: builder.query<
      ApiEnvelope<{ entries: JournalEntry[]; total: number; page: number; totalPages: number }>,
      { storeId: string; page?: number; limit?: number; source?: string }
    >({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/accounting/journal`,
        params,
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Accounting", id: `${storeId}-journal` }],
    }),

    postJournalEntry: builder.mutation<ApiEnvelope<JournalEntry>, { storeId: string; body: any }>({
      query: ({ storeId, body }) => ({
        url: `/stores/${storeId}/accounting/journal`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [
        { type: "Accounting", id: `${storeId}-journal` },
        { type: "Accounting", id: `${storeId}-accounts` },
      ],
    }),

    // ── Financial Statements ──
    getFinancialStatements: builder.query<ApiEnvelope<FinancialStatements>, string>({
      query: (storeId) => ({
        url: `/stores/${storeId}/accounting/statements`,
      }),
      providesTags: (_r, _e, storeId) => [{ type: "Accounting", id: `${storeId}-statements` }],
    }),

    // ── Expenses ──
    getExpenses: builder.query<
      ApiEnvelope<{ expenses: Expense[]; total: number; totalSpent: number; page: number; totalPages: number }>,
      { storeId: string; page?: number; limit?: number; category?: string; status?: string }
    >({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/accounting/expenses`,
        params,
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Accounting", id: `${storeId}-expenses` }],
    }),

    createExpense: builder.mutation<ApiEnvelope<Expense>, { storeId: string; body: any }>({
      query: ({ storeId, body }) => ({
        url: `/stores/${storeId}/accounting/expenses`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [
        { type: "Accounting", id: `${storeId}-expenses` },
        { type: "Accounting", id: `${storeId}-accounts` },
        { type: "Accounting", id: `${storeId}-journal` },
      ],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useCreateAccountMutation,
  useGetJournalEntriesQuery,
  usePostJournalEntryMutation,
  useGetFinancialStatementsQuery,
  useGetExpensesQuery,
  useCreateExpenseMutation,
} = accountingApi;
