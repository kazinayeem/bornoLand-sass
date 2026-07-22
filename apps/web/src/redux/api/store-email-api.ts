import { baseApi } from "@/redux/api/base-api";
import { assertApiSuccess, type ApiEnvelope } from "@/lib/api/envelope";

export type StoreEmailConfig = {
  _id?: string;
  storeId: string;
  senderName: string;
  senderEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassSet: boolean;
  encryption: "tls" | "ssl" | "starttls" | "none";
  replyToEmail: string;
  bccEmail: string;
  enabled: boolean;
  defaultLanguage: string;
  timezone: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateEmailConfigPayload = {
  senderName?: string;
  senderEmail?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  encryption?: "tls" | "ssl" | "starttls" | "none";
  replyToEmail?: string;
  bccEmail?: string;
  enabled?: boolean;
  defaultLanguage?: string;
  timezone?: string;
};

export type StoreEmailTemplate = {
  _id: string;
  storeId: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  description: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateEmailTemplatePayload = {
  name?: string;
  subject?: string;
  body?: string;
  variables?: string[];
  description?: string;
  isDefault?: boolean;
};

export type StoreEmailBranding = {
  _id?: string;
  storeId: string;
  logo: string;
  primaryColor: string;
  buttonColor: string;
  footer: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    x: string;
    linkedin: string;
    youtube: string;
  };
  website: string;
  supportEmail: string;
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateEmailBrandingPayload = {
  logo?: string;
  primaryColor?: string;
  buttonColor?: string;
  footer?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    x?: string;
    linkedin?: string;
    youtube?: string;
  };
  website?: string;
  supportEmail?: string;
  phone?: string;
  address?: string;
};

export type StoreEmailLog = {
  _id: string;
  storeId: string;
  templateName: string;
  recipient: string;
  subject: string;
  status: "pending" | "sent" | "failed" | "bounced" | "opened" | "clicked";
  sentAt?: string;
  retries: number;
  maxRetries: number;
  providerResponse: string;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
};

type EmailConfigResponse = { config: StoreEmailConfig };
type EmailTemplatesResponse = { templates: StoreEmailTemplate[] };
type EmailTemplateResponse = { template: StoreEmailTemplate };
type EmailBrandingResponse = { branding: StoreEmailBranding };
type EmailLogsResponse = { logs: StoreEmailLog[]; total: number; page: number; limit: number; totalPages: number };
type EmailLogResponse = { log: StoreEmailLog };

export const storeEmailApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmailConfig: builder.query<StoreEmailConfig, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/email/config` }),
      transformResponse: (response: ApiEnvelope<EmailConfigResponse>) => {
        assertApiSuccess(response, "Failed to load email configuration");
        return response.data!.config;
      },
      providesTags: (_result, _error, storeId) => [{ type: "EmailConfig", id: storeId }],
    }),
    updateEmailConfig: builder.mutation<StoreEmailConfig, { storeId: string; data: UpdateEmailConfigPayload }>({
      query: ({ storeId, data }) => ({
        url: `/stores/${storeId}/email/config`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiEnvelope<EmailConfigResponse>) => {
        assertApiSuccess(response, "Failed to save email configuration");
        return response.data!.config;
      },
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "EmailConfig", id: storeId }],
    }),
    getEmailTemplates: builder.query<StoreEmailTemplate[], string>({
      query: (storeId) => ({ url: `/stores/${storeId}/email/templates` }),
      transformResponse: (response: ApiEnvelope<EmailTemplatesResponse>) => {
        assertApiSuccess(response, "Failed to load email templates");
        return response.data!.templates;
      },
      providesTags: (_result, _error, storeId) => [{ type: "EmailTemplates", id: storeId }],
    }),
    getEmailTemplate: builder.query<StoreEmailTemplate, { storeId: string; templateId: string }>({
      query: ({ storeId, templateId }) => ({ url: `/stores/${storeId}/email/templates/${templateId}` }),
      transformResponse: (response: ApiEnvelope<EmailTemplateResponse>) => {
        assertApiSuccess(response, "Failed to load email template");
        return response.data!.template;
      },
      providesTags: (_result, _error, { storeId, templateId }) => [{ type: "EmailTemplate", id: `${storeId}_${templateId}` }],
    }),
    updateEmailTemplate: builder.mutation<StoreEmailTemplate, { storeId: string; templateId: string; data: UpdateEmailTemplatePayload }>({
      query: ({ storeId, templateId, data }) => ({
        url: `/stores/${storeId}/email/templates/${templateId}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiEnvelope<EmailTemplateResponse>) => {
        assertApiSuccess(response, "Failed to update email template");
        return response.data!.template;
      },
      invalidatesTags: (_result, _error, { storeId }) => [
        { type: "EmailTemplates", id: storeId },
        { type: "EmailTemplate", id: `${storeId}_${_error}` },
      ],
    }),
    resetEmailTemplate: builder.mutation<StoreEmailTemplate, { storeId: string; templateId: string }>({
      query: ({ storeId, templateId }) => ({
        url: `/stores/${storeId}/email/templates/${templateId}/reset`,
        method: "POST",
      }),
      transformResponse: (response: ApiEnvelope<EmailTemplateResponse>) => {
        assertApiSuccess(response, "Failed to reset email template");
        return response.data!.template;
      },
      invalidatesTags: (_result, _error, { storeId, templateId }) => [
        { type: "EmailTemplates", id: storeId },
        { type: "EmailTemplate", id: `${storeId}_${templateId}` },
      ],
    }),
    duplicateEmailTemplate: builder.mutation<StoreEmailTemplate, { storeId: string; templateId: string }>({
      query: ({ storeId, templateId }) => ({
        url: `/stores/${storeId}/email/templates/${templateId}/duplicate`,
        method: "POST",
      }),
      transformResponse: (response: ApiEnvelope<EmailTemplateResponse>) => {
        assertApiSuccess(response, "Failed to duplicate email template");
        return response.data!.template;
      },
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "EmailTemplates", id: storeId }],
    }),
    getEmailBranding: builder.query<StoreEmailBranding, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/email/branding` }),
      transformResponse: (response: ApiEnvelope<EmailBrandingResponse>) => {
        assertApiSuccess(response, "Failed to load email branding");
        return response.data!.branding;
      },
      providesTags: (_result, _error, storeId) => [{ type: "EmailBranding", id: storeId }],
    }),
    updateEmailBranding: builder.mutation<StoreEmailBranding, { storeId: string; data: UpdateEmailBrandingPayload }>({
      query: ({ storeId, data }) => ({
        url: `/stores/${storeId}/email/branding`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiEnvelope<EmailBrandingResponse>) => {
        assertApiSuccess(response, "Failed to save email branding");
        return response.data!.branding;
      },
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "EmailBranding", id: storeId }],
    }),
    sendTestEmail: builder.mutation<{ recipient: string }, { storeId: string; recipient: string }>({
      query: ({ storeId, recipient }) => ({
        url: `/stores/${storeId}/email/test`,
        method: "POST",
        body: { recipient },
      }),
      transformResponse: (response: ApiEnvelope<{ recipient: string }>) => {
        assertApiSuccess(response, "Failed to send test email");
        return response.data!;
      },
    }),
    getEmailLogs: builder.query<EmailLogsResponse, { storeId: string; page?: number; limit?: number; status?: string; search?: string }>({
      query: ({ storeId, page, limit, status, search }) => ({
        url: `/stores/${storeId}/email/logs`,
        params: { page, limit, status, search },
      }),
      transformResponse: (response: ApiEnvelope<EmailLogsResponse>) => {
        assertApiSuccess(response, "Failed to load email logs");
        return response.data!;
      },
      providesTags: (_result, _error, { storeId }) => [{ type: "EmailLogs", id: storeId }],
    }),
    getEmailLog: builder.query<StoreEmailLog, { storeId: string; logId: string }>({
      query: ({ storeId, logId }) => ({ url: `/stores/${storeId}/email/logs/${logId}` }),
      transformResponse: (response: ApiEnvelope<EmailLogResponse>) => {
        assertApiSuccess(response, "Failed to load email log");
        return response.data!.log;
      },
      providesTags: (_result, _error, { storeId, logId }) => [{ type: "EmailLog", id: `${storeId}_${logId}` }],
    }),
  }),
});

export const {
  useGetEmailConfigQuery,
  useUpdateEmailConfigMutation,
  useGetEmailTemplatesQuery,
  useGetEmailTemplateQuery,
  useUpdateEmailTemplateMutation,
  useResetEmailTemplateMutation,
  useDuplicateEmailTemplateMutation,
  useGetEmailBrandingQuery,
  useUpdateEmailBrandingMutation,
  useSendTestEmailMutation,
  useGetEmailLogsQuery,
  useGetEmailLogQuery,
} = storeEmailApi;
