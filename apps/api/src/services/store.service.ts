import { StoreModel } from "../models/store.model.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/1600x900/png";

const DEFAULT_STORE_DATA = {
  hero: {
    imageUrl: `${PLACEHOLDER_IMAGE_URL}?text=Store`,
  },
};

export async function createStore(data: Record<string, unknown>) {
  const store = await StoreModel.create({
    ...data,
    ...DEFAULT_STORE_DATA,
  });
  return store;
}
