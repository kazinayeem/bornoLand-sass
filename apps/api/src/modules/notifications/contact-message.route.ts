import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import {
  listContactMessagesController,
  getContactMessageController,
  updateContactMessageController,
  deleteContactMessageController,
  exportContactMessagesController,
} from "./contact.controller.js";

export const contactMessageRouter: Router = Router({ mergeParams: true });

contactMessageRouter.use(requireAuth);
contactMessageRouter.get("/", listContactMessagesController);
contactMessageRouter.get("/export", exportContactMessagesController);
contactMessageRouter.get("/:id", getContactMessageController);
contactMessageRouter.patch("/:id", updateContactMessageController);
contactMessageRouter.delete("/:id", deleteContactMessageController);
