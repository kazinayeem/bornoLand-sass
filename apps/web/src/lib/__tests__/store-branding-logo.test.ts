import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveMediaUrl } from "../resolve-media-url";
import { getStoreLogoUrl, getStoreInitials } from "../store-branding";

describe("Store Branding Logo & Media URL Resolution", () => {
  it("1. Returns empty string for falsy, whitespace, or invalid string inputs", () => {
    assert.equal(resolveMediaUrl(""), "");
    assert.equal(resolveMediaUrl("   "), "");
    assert.equal(resolveMediaUrl(null), "");
    assert.equal(resolveMediaUrl(undefined), "");
    assert.equal(resolveMediaUrl("null"), "");
    assert.equal(resolveMediaUrl("undefined"), "");
  });

  it("2. Preserves data: and blob: URLs untouched", () => {
    const dataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    assert.equal(resolveMediaUrl(dataUri), dataUri);

    const blobUri = "blob:http://localhost:3000/1234-5678";
    assert.equal(resolveMediaUrl(blobUri), blobUri);
  });

  it("3. Correctly routes local upload paths through Next.js proxy", () => {
    assert.equal(
      resolveMediaUrl("/uploads/stores/nayeem/branding/logo.png"),
      "/api/uploads/stores/nayeem/branding/logo.png"
    );
    assert.equal(
      resolveMediaUrl("uploads/stores/nayeem/branding/logo.png"),
      "/api/uploads/stores/nayeem/branding/logo.png"
    );
    assert.equal(
      resolveMediaUrl("/api/uploads/stores/nayeem/branding/logo.png"),
      "/api/uploads/stores/nayeem/branding/logo.png"
    );
  });

  it("4. Rewrites loopback API server upload URLs to same-origin proxy", () => {
    assert.equal(
      resolveMediaUrl("http://localhost:4000/uploads/stores/nayeem/branding/logo.png"),
      "/api/uploads/stores/nayeem/branding/logo.png"
    );
    assert.equal(
      resolveMediaUrl("http://127.0.0.1:4000/uploads/stores/nayeem/branding/logo.png"),
      "/api/uploads/stores/nayeem/branding/logo.png"
    );
    assert.equal(
      resolveMediaUrl("http://localhost:4000/api/uploads/stores/nayeem/branding/logo.png"),
      "/api/uploads/stores/nayeem/branding/logo.png"
    );
  });

  it("5. Preserves remote CDN / external image URLs without stripping hostnames", () => {
    const unsplashUrl = "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&auto=format&fit=crop&q=80";
    assert.equal(resolveMediaUrl(unsplashUrl), unsplashUrl);

    const cloudinaryUrl = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
    assert.equal(resolveMediaUrl(cloudinaryUrl), cloudinaryUrl);

    // S3 URL that contains '/uploads/' in path should NOT be stripped
    const s3WithUploadsPath = "https://my-bucket.s3.amazonaws.com/uploads/stores/logo.png";
    assert.equal(resolveMediaUrl(s3WithUploadsPath), s3WithUploadsPath);
  });

  it("6. getStoreLogoUrl resolves logo from multiple candidate sources", () => {
    // 1. Direct logoUrl
    assert.equal(
      getStoreLogoUrl({ logoUrl: "https://example.com/logo.png" } as any),
      "https://example.com/logo.png"
    );

    // 2. Relative logoUrl
    assert.equal(
      getStoreLogoUrl({ logoUrl: "/uploads/stores/organic/logo.png" } as any),
      "/api/uploads/stores/organic/logo.png"
    );

    // 3. Fallback: store.logo
    assert.equal(
      getStoreLogoUrl({ logo: "https://example.com/legacy-logo.png" } as any),
      "https://example.com/legacy-logo.png"
    );

    // 4. Fallback: store.branding.logoUrl
    assert.equal(
      getStoreLogoUrl({ branding: { logoUrl: "/uploads/branding/logo.png" } } as any),
      "/api/uploads/branding/logo.png"
    );

    // 5. Fallback: populated store.logoMediaId
    assert.equal(
      getStoreLogoUrl({ logoMediaId: { publicUrl: "/uploads/media/123.webp" } } as any),
      "/api/uploads/media/123.webp"
    );

    // 6. Missing logo returns empty string
    assert.equal(getStoreLogoUrl({ name: "Demo Store" } as any), "");
    assert.equal(getStoreLogoUrl(null), "");
  });

  it("7. getStoreInitials produces 2-letter uppercase initials for fallback avatar", () => {
    assert.equal(getStoreInitials("Fresh Groceries"), "FG");
    assert.equal(getStoreInitials("BornoLand"), "BO");
    assert.equal(getStoreInitials("Store"), "ST");
    assert.equal(getStoreInitials("", "Super Shop"), "SS");
    assert.equal(getStoreInitials(undefined, undefined), "ST");
  });
});
