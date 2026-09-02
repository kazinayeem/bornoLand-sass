import { baseApi } from "@/redux/api/base-api";

export type OperationTask = {
  _id: string;
  storeId: string;
  taskNumber: string;
  title: string;
  description: string;
  module: "inventory" | "hrm" | "finance" | "pos" | "orders" | "marketing" | "general";
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "under_review" | "completed" | "cancelled";
  assignedTo: string;
  dueDate?: string | null;
  isApprovalWorkflow: boolean;
  approvedBy?: string;
  approvedAt?: string | null;
  entityReference?: {
    entityType: string;
    entityId?: string;
  };
  createdBy: string;
  createdAt: string;
};

export type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
  message?: string;
};

export const operationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<
      ApiEnvelope<{ tasks: OperationTask[]; total: number; pendingApprovals: number }>,
      { storeId: string; module?: string; status?: string }
    >({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/operations/tasks`,
        params,
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Audit", id: `${storeId}-tasks` }],
    }),

    createTask: builder.mutation<ApiEnvelope<OperationTask>, { storeId: string; body: any }>({
      query: ({ storeId, body }) => ({
        url: `/stores/${storeId}/operations/tasks`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Audit", id: `${storeId}-tasks` }],
    }),

    updateTaskStatus: builder.mutation<
      ApiEnvelope<OperationTask>,
      { storeId: string; taskId: string; status: string }
    >({
      query: ({ storeId, taskId, ...body }) => ({
        url: `/stores/${storeId}/operations/tasks/${taskId}/status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Audit", id: `${storeId}-tasks` }],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
} = operationsApi;
