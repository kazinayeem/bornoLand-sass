import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import {
  adminListTemplatesController, listTemplatesController, getTemplateController,
  createTemplateController, updateTemplateController, deleteTemplateController,
  applyTemplateController
} from "./template.controller.js";

export const templateRouter: Router = Router();

templateRouter.get("/", listTemplatesController);
templateRouter.get("/admin", requireAuth, adminListTemplatesController);
templateRouter.get("/:id", getTemplateController);
templateRouter.post("/create", requireAuth, createTemplateController);
templateRouter.put("/:id", requireAuth, updateTemplateController);
templateRouter.delete("/:id", requireAuth, deleteTemplateController);
templateRouter.post("/apply", requireAuth, applyTemplateController);
