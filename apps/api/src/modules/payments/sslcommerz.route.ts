import { Router, urlencoded } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import {
  getStoreSSLCommerzController,
  updateStoreSSLCommerzController,
  testStoreSSLCommerzController,
  toggleStoreSSLCommerzController,
  initiateSSLCommerzPaymentController,
  sslcommerzSuccessCallbackController,
  sslcommerzFailCallbackController,
  sslcommerzCancelCallbackController,
  sslcommerzIpnController,
  adminListStoreGatewaysController,
} from "./sslcommerz.controller.js";

/** Store-scoped router for dashboard management */
export const storeSSLCommerzRouter: Router = Router({ mergeParams: true });

storeSSLCommerzRouter.use(requireAuth);
storeSSLCommerzRouter.get("/", getStoreSSLCommerzController);
storeSSLCommerzRouter.put("/", updateStoreSSLCommerzController);
storeSSLCommerzRouter.post("/test", testStoreSSLCommerzController);
storeSSLCommerzRouter.post("/toggle", toggleStoreSSLCommerzController);

/** Public payment session and callback router */
export const publicSSLCommerzRouter: Router = Router();

// Allow urlencoded payloads from SSLCommerz POST callbacks
publicSSLCommerzRouter.use(urlencoded({ extended: true }));

publicSSLCommerzRouter.post("/initiate", initiateSSLCommerzPaymentController);
publicSSLCommerzRouter.all("/success", sslcommerzSuccessCallbackController);
publicSSLCommerzRouter.all("/fail", sslcommerzFailCallbackController);
publicSSLCommerzRouter.all("/cancel", sslcommerzCancelCallbackController);
publicSSLCommerzRouter.all("/ipn", sslcommerzIpnController);

/** Admin router for listing all store gateways */
export const adminPaymentGatewaysRouter: Router = Router();
adminPaymentGatewaysRouter.use(requireAuth);
adminPaymentGatewaysRouter.get("/stores", adminListStoreGatewaysController);
