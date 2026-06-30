import { Router } from "express";
import { subdomainDetector } from "../../common/middleware/subdomain.middleware.js";
import { resolveStoreFromSubdomain } from "../../common/middleware/subdomain.middleware.js";
import { getWishlistController, toggleWishlistController } from "./wishlist.controller.js";

export const wishlistRouter: Router = Router();

wishlistRouter.use(subdomainDetector);
wishlistRouter.use(resolveStoreFromSubdomain);

wishlistRouter.get("/", getWishlistController);
wishlistRouter.post("/toggle", toggleWishlistController);
