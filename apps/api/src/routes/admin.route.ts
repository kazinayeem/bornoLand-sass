import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { UserModel } from "../models/user.model.js";
import { StoreModel } from "../models/store.model.js";
import { ProductModel } from "../models/product.model.js";
import { TemplateModel } from "../models/template.model.js";

export const adminRouter = Router();

adminRouter.use(requireAuth);

adminRouter.get("/overview", async (_request, response) => {
  const [users, stores, products, templates] = await Promise.all([
    UserModel.countDocuments(),
    StoreModel.countDocuments(),
    ProductModel.countDocuments(),
    TemplateModel.countDocuments()
  ]);
  response.json({ data: { users, stores, products, templates } });
});

adminRouter.get("/users", async (_request, response) => {
  const users = await UserModel.find().sort({ createdAt: -1 }).lean();
  response.json({ data: { users } });
});

adminRouter.get("/stores", async (_request, response) => {
  const stores = await StoreModel.find().populate("selectedTemplateId", "name slug").sort({ createdAt: -1 }).lean();
  response.json({ data: { stores } });
});

adminRouter.get("/products", async (_request, response) => {
  const products = await ProductModel.find().sort({ createdAt: -1 }).lean();
  response.json({ data: { products } });
});
