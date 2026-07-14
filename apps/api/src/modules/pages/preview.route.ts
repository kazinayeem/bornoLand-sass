import { Router } from "express";
import type { Response } from "express";
import type { Request } from "express";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";
import { getPageByPreviewToken } from "./store-page.service.js";

export const previewRouter: Router = Router();

// Public preview endpoint — no auth required
previewRouter.get("/:token", async (request: Request, response: Response) => {
  const result = await getPageByPreviewToken(request.params.token as string);
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message, 410);
});
