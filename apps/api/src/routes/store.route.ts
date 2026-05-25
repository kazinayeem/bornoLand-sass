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
import { getStoreSettingsController, updateStoreSettingsController } from "../controllers/store-settings.controller.js";
import { createHomepageSliderController, deleteHomepageSliderController, listHomepageSlidersController, updateHomepageSliderController } from "../controllers/homepage-slider.controller.js";

export const storeRouter = Router();

storeRouter.use(requireAuth);

storeRouter.post("/create", createStoreController);
storeRouter.get("/my-stores", getUserStoresController);
storeRouter.get("/:id", getStoreController);
storeRouter.put("/:id", updateStoreController);
storeRouter.put("/:id/theme", changeStoreThemeController);
storeRouter.get("/:id/settings", getStoreSettingsController);
storeRouter.put("/:id/settings", updateStoreSettingsController);
storeRouter.get("/:id/sliders", listHomepageSlidersController);
storeRouter.post("/:id/sliders", createHomepageSliderController);
storeRouter.put("/:id/sliders/:sliderId", updateHomepageSliderController);
storeRouter.delete("/:id/sliders/:sliderId", deleteHomepageSliderController);
storeRouter.delete("/:id", deleteStoreController);
