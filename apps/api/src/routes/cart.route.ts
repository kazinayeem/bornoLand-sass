import { Router } from "express";
import { subdomainDetector, resolveStoreFromSubdomain } from "../middleware/subdomain.middleware.js";
import { getCartController, addToCartController, updateCartController, removeFromCartController } from "../controllers/cart.controller.js";

export const cartRouter = Router();

cartRouter.use(subdomainDetector);
cartRouter.use(resolveStoreFromSubdomain);

cartRouter.get("/", getCartController);
cartRouter.post("/add", addToCartController);
cartRouter.put("/update", updateCartController);
cartRouter.delete("/remove/:productId", removeFromCartController);
