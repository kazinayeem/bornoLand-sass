import { Router } from "express";
import { generateShopHandler, improveSectionHandler } from "./ai.controller.js";

const router: Router = Router();

router.post("/shop-builder/generate", generateShopHandler);
router.post("/shop-builder/improve-section", improveSectionHandler);

export { router as aiRouter };
