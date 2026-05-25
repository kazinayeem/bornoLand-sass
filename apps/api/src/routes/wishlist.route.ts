import { Router } from "express";
import { subdomainDetector } from "../middleware/subdomain.middleware.js";
import { resolveStoreFromSubdomain } from "../middleware/subdomain.middleware.js";
import { getWishlistController, toggleWishlistController } from "../controllers/wishlist.controller.js";

export const wishlistRouter = Router();

wishlistRouter.use(subdomainDetector);
wishlistRouter.use(resolveStoreFromSubdomain);

wishlistRouter.get("/", getWishlistController);
wishlistRouter.post("/toggle", toggleWishlistController);
