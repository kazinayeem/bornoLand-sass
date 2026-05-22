import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createStoreController,
  deleteStoreController,
  getStoreController,
  getUserStoresController,
  updateStoreController,
  changeStoreThemeController
} from "../controllers/store.controller.js";

export const storeRouter = Router();

storeRouter.use(requireAuth);

storeRouter.post("/create", createStoreController);
storeRouter.get("/my-stores", getUserStoresController);
storeRouter.get("/:id", getStoreController);
storeRouter.put("/:id", updateStoreController);
storeRouter.put("/:id/theme", changeStoreThemeController);
storeRouter.delete("/:id", deleteStoreController);
