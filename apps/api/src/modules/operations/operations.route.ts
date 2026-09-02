import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  listOperationTasksController,
  createOperationTaskController,
  updateOperationTaskStatusController,
} from "./operations.controller.js";

export const operationsRouter: Router = Router({ mergeParams: true });

const storeId = (req: { params: { storeId?: string } }) => String(req.params.storeId);
const operationsGuard = requireFeatureAccess("operations", { getStoreId: storeId });

operationsRouter.use(requireAuth);

operationsRouter.get("/tasks", operationsGuard, listOperationTasksController);
operationsRouter.post("/tasks", operationsGuard, createOperationTaskController);
operationsRouter.put("/tasks/:taskId/status", operationsGuard, updateOperationTaskStatusController);
