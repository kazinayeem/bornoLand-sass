import { Router } from "express";
import { requireCustomerAuth } from "./customer-auth.middleware.js";
import {
  createCustomerAddressController,
  deleteCustomerAddressController,
  listCustomerAddressesController,
  setDefaultCustomerAddressController,
  updateCustomerAddressController,
} from "./customer-address.controller.js";

export const customerAddressRouter: Router = Router();

customerAddressRouter.use(requireCustomerAuth);
customerAddressRouter.get("/", listCustomerAddressesController);
customerAddressRouter.post("/", createCustomerAddressController);
customerAddressRouter.patch("/:id", updateCustomerAddressController);
customerAddressRouter.patch("/:id/default", setDefaultCustomerAddressController);
customerAddressRouter.delete("/:id", deleteCustomerAddressController);
