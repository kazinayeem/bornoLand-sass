import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";

import { getEmailConfigController, updateEmailConfigController } from "./store-email-config.controller.js";
import {
  listEmailTemplatesController,
  getEmailTemplateController,
  updateEmailTemplateController,
  resetEmailTemplateController,
  duplicateEmailTemplateController,
} from "./store-email-template.controller.js";
import { getEmailBrandingController, updateEmailBrandingController } from "./store-email-branding.controller.js";
import { listEmailLogsController, getEmailLogController } from "./store-email-log.controller.js";
import { sendTestEmailController } from "./test-email.controller.js";

export const storeEmailRouter: Router = Router();

storeEmailRouter.use(requireAuth);

storeEmailRouter.get("/:storeId/email/config", getEmailConfigController);
storeEmailRouter.put("/:storeId/email/config", updateEmailConfigController);

storeEmailRouter.get("/:storeId/email/templates", listEmailTemplatesController);
storeEmailRouter.get("/:storeId/email/templates/:templateId", getEmailTemplateController);
storeEmailRouter.put("/:storeId/email/templates/:templateId", updateEmailTemplateController);
storeEmailRouter.post("/:storeId/email/templates/:templateId/reset", resetEmailTemplateController);
storeEmailRouter.post("/:storeId/email/templates/:templateId/duplicate", duplicateEmailTemplateController);

storeEmailRouter.get("/:storeId/email/branding", getEmailBrandingController);
storeEmailRouter.put("/:storeId/email/branding", updateEmailBrandingController);

storeEmailRouter.post("/:storeId/email/test", sendTestEmailController);

storeEmailRouter.get("/:storeId/email/logs", listEmailLogsController);
storeEmailRouter.get("/:storeId/email/logs/:logId", getEmailLogController);
