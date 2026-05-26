import { StoreModel } from "../models/store.model.js";

function buildPlaceholderImage(label: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#e2e8f0"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#334155" font-family="Arial, Helvetica, sans-serif" font-size="72">${label}</text></svg>`
  )}`;
}

const DEFAULT_STORE_DATA = {
  hero: {
    imageUrl: buildPlaceholderImage("Store"),
  },
};

export async function createStore(data: Record<string, unknown>) {
  const store = await StoreModel.create({
    ...data,
    ...DEFAULT_STORE_DATA,
  });
  return store;
}
