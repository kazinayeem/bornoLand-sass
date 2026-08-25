import { baseApi } from "@/redux/api/base-api";
import type { AiGenerateShopRequest, AiGeneratedShopConfig } from "@/types/ai-shop-builder";

export interface AiGenerateResponse {
  ok: boolean;
  data: {
    config: AiGeneratedShopConfig;
  };
  message?: string;
}

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    generateAiShop: builder.mutation<AiGenerateResponse, AiGenerateShopRequest>({
      query: (body) => ({
        url: "/ai/shop-builder/generate",
        method: "POST",
        body,
      }),
    }),
    improveSectionWithAi: builder.mutation<
      { ok: boolean; data: { props: Record<string, any> }; message?: string },
      { sectionType: string; currentProps: Record<string, any>; prompt: string; language?: string }
    >({
      query: (body) => ({
        url: "/ai/shop-builder/improve-section",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGenerateAiShopMutation,
  useImproveSectionWithAiMutation,
} = aiApi;
