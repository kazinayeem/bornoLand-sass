import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  cartReducer,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  hydrateCart,
  syncFromStorage,
  getCartStorageKey,
} from "../cart-slice.js";

// Mock localStorage for Node.js test environment
const mockStorage: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = String(value);
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const key of Object.keys(mockStorage)) {
      delete mockStorage[key];
    }
  },
};
(globalThis as any).window = {
  location: { hostname: "nayeem.localhost", pathname: "/" },
};

describe("Local-First Tenant-Scoped Cart Architecture", () => {
  beforeEach(() => {
    (globalThis as any).localStorage.clear();
  });

  it("Test 1: Generates tenant-scoped storage keys", () => {
    assert.equal(getCartStorageKey("nayeem"), "cart:nayeem");
    assert.equal(getCartStorageKey("SuperStore"), "cart:superstore");
    assert.equal(getCartStorageKey("   store_abc   "), "cart:store_abc");
  });

  it("Test 2: Adds new item instantly and persists to tenant localStorage", () => {
    let state = cartReducer(undefined, hydrateCart({ tenantSlug: "nayeem" }));
    assert.equal(state.items.length, 0);
    assert.equal(state.hydrated, true);

    state = cartReducer(
      state,
      addToCart({
        productId: "prod_1",
        name: "Fresh Milk",
        price: 85,
        quantity: 1,
        image: "/img/milk.png",
      }),
    );

    assert.equal(state.items.length, 1);
    assert.equal(state.items[0].productId, "prod_1");
    assert.equal(state.items[0].quantity, 1);

    const stored = JSON.parse(mockStorage["cart:nayeem"] || "[]");
    assert.equal(stored.length, 1);
    assert.equal(stored[0].productId, "prod_1");
  });

  it("Test 3: Rapid consecutive Add to Cart increments quantity without losing updates", () => {
    let state = cartReducer(undefined, hydrateCart({ tenantSlug: "nayeem" }));

    for (let i = 0; i < 5; i++) {
      state = cartReducer(
        state,
        addToCart({
          productId: "prod_2",
          name: "Organic Honey",
          price: 500,
          quantity: 1,
          image: "/img/honey.png",
        }),
      );
    }

    assert.equal(state.items.length, 1);
    assert.equal(state.items[0].quantity, 5);

    const stored = JSON.parse(mockStorage["cart:nayeem"] || "[]");
    assert.equal(stored[0].quantity, 5);
  });

  it("Test 4: Quantity controls (+ / -) update instantly and remove when 0", () => {
    let state = cartReducer(undefined, hydrateCart({ tenantSlug: "nayeem" }));
    state = cartReducer(
      state,
      addToCart({
        productId: "prod_3",
        name: "Dark Chocolate",
        price: 250,
        quantity: 3,
        image: "/img/choc.png",
      }),
    );

    // Increase to 4
    state = cartReducer(state, updateQuantity({ productId: "prod_3", quantity: 4 }));
    assert.equal(state.items[0].quantity, 4);

    // Decrease to 2
    state = cartReducer(state, updateQuantity({ productId: "prod_3", quantity: 2 }));
    assert.equal(state.items[0].quantity, 2);

    // Decrease to 0 removes the item
    state = cartReducer(state, updateQuantity({ productId: "prod_3", quantity: 0 }));
    assert.equal(state.items.length, 0);

    const stored = JSON.parse(mockStorage["cart:nayeem"] || "[]");
    assert.equal(stored.length, 0);
  });

  it("Test 5: Explicit removal instantly removes item from state and storage", () => {
    let state = cartReducer(undefined, hydrateCart({ tenantSlug: "nayeem" }));
    state = cartReducer(
      state,
      addToCart({ productId: "prod_A", name: "Apple", price: 30, quantity: 2, image: "" }),
    );
    state = cartReducer(
      state,
      addToCart({ productId: "prod_B", name: "Banana", price: 20, quantity: 5, image: "" }),
    );
    assert.equal(state.items.length, 2);

    state = cartReducer(state, removeFromCart("prod_A"));
    assert.equal(state.items.length, 1);
    assert.equal(state.items[0].productId, "prod_B");

    const stored = JSON.parse(mockStorage["cart:nayeem"] || "[]");
    assert.equal(stored.length, 1);
    assert.equal(stored[0].productId, "prod_B");
  });

  it("Test 6: Tenant Isolation — store A and store B never share or overwrite carts", () => {
    // Tenant A (nayeem)
    let stateA = cartReducer(undefined, hydrateCart({ tenantSlug: "nayeem" }));
    stateA = cartReducer(
      stateA,
      addToCart({ productId: "prod_1", name: "Item in Nayeem Store", price: 100, quantity: 2, image: "" }),
    );

    // Tenant B (techstore)
    let stateB = cartReducer(undefined, hydrateCart({ tenantSlug: "techstore" }));
    stateB = cartReducer(
      stateB,
      addToCart({ productId: "prod_99", name: "Laptop in Tech Store", price: 80000, quantity: 1, image: "" }),
    );

    // Verify storage keys
    const nayeemCart = JSON.parse(mockStorage["cart:nayeem"] || "[]");
    const techCart = JSON.parse(mockStorage["cart:techstore"] || "[]");

    assert.equal(nayeemCart.length, 1);
    assert.equal(nayeemCart[0].name, "Item in Nayeem Store");

    assert.equal(techCart.length, 1);
    assert.equal(techCart[0].name, "Laptop in Tech Store");

    // Clear tenant A cart
    cartReducer(stateA, clearCart({ tenantSlug: "nayeem" }));
    const nayeemAfter = JSON.parse(mockStorage["cart:nayeem"] || "[]");
    const techAfter = JSON.parse(mockStorage["cart:techstore"] || "[]");

    assert.equal(nayeemAfter.length, 0);
    assert.equal(techAfter.length, 1); // Tech Store cart is completely preserved!
  });

  it("Test 7: Multi-tab sync updates cart state when storage event occurs", () => {
    let state = cartReducer(undefined, hydrateCart({ tenantSlug: "nayeem" }));
    assert.equal(state.items.length, 0);

    const externalTabItems = [
      { productId: "prod_sync_1", name: "Synced Item", price: 150, quantity: 3, image: "" },
    ];

    state = cartReducer(state, syncFromStorage({ items: externalTabItems, tenantSlug: "nayeem" }));
    assert.equal(state.items.length, 1);
    assert.equal(state.items[0].productId, "prod_sync_1");
    assert.equal(state.items[0].quantity, 3);
  });
});
