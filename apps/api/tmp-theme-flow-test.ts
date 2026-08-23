import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import mongoose from "mongoose";
import { migrateThemeSections } from "../web/src/themes/registry.ts";

const API = "http://localhost:3000/api";
const storeId = "6a5737692f76b860979ef38f";
const pageId = "6a5737872f76b860979ef4a6";

async function login() {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@bornoland.com", password: "Demo@123", loginType: "user" }),
  });
  const json = await res.json();
  if (!json.data?.accessToken) throw new Error("login failed");
  return json.data.accessToken as string;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DB || "bornoland" });
  const home = await mongoose.connection.collection("storepages").findOne({ _id: new mongoose.Types.ObjectId(pageId) });
  await mongoose.disconnect();

  const sections = migrateThemeSections("electronics", (home?.sections as never[]) ?? []);
  const token = await login();

  const themeRes = await fetch(`${API}/stores/${storeId}/theme`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      theme: {
        themeId: "electronics",
        primaryColor: "#081621",
        secondaryColor: "#ef4444",
        font: "Inter, system-ui, sans-serif",
        darkMode: false,
      },
    }),
  });
  const themeJson = await themeRes.json();
  console.log("theme:", themeRes.status, themeJson.success, themeJson.data?.store?.theme?.themeId);

  const pageRes = await fetch(`${API}/store-pages/${pageId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      storeId,
      sections,
      headerSettings: { announcementText: "test" },
      footerSettings: { copyright: "test" },
    }),
  });
  const pageJson = await pageRes.json();
  console.log("page:", pageRes.status, pageJson.success, pageJson.message ?? "ok");
}

main().catch((e) => console.error(e));
