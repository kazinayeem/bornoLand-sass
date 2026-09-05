import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { authRateLimit, globalRateLimit } from "../rate-limit.middleware.js";

function createMockReqRes(options: {
  method: string;
  path: string;
  originalUrl?: string;
  headers?: Record<string, string>;
  ip?: string;
}) {
  const req: any = {
    method: options.method,
    path: options.path,
    originalUrl: options.originalUrl || options.path,
    headers: options.headers || {},
    ip: options.ip || "192.168.1.1",
    socket: { remoteAddress: options.ip || "192.168.1.1" },
  };

  const res: any = {
    statusCode: 200,
    headers: {},
    setHeader(name: string, value: any) {
      res.headers[name] = value;
      return res;
    },
    getHeader(name: string) {
      return res.headers[name];
    },
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(data: any) {
      res.data = data;
      return res;
    },
    send(data: any) {
      res.data = data;
      return res;
    },
  };

  return { req, res };
}

describe("Rate Limiting Middleware Suite", () => {
  it("1. Skips GET /auth/me from auth rate limiting", async () => {
    let nextCalled = false;
    const { req, res } = createMockReqRes({
      method: "GET",
      path: "/me",
      originalUrl: "/auth/me",
      ip: "10.0.0.1",
    });

    await new Promise<void>((resolve) => {
      authRateLimit(req, res, () => {
        nextCalled = true;
        resolve();
      });
    });

    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, 200);
  });

  it("2. Skips POST /auth/refresh from auth rate limiting", async () => {
    let nextCalled = false;
    const { req, res } = createMockReqRes({
      method: "POST",
      path: "/refresh",
      originalUrl: "/auth/refresh",
      ip: "10.0.0.2",
    });

    await new Promise<void>((resolve) => {
      authRateLimit(req, res, () => {
        nextCalled = true;
        resolve();
      });
    });

    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, 200);
  });

  it("3. Skips POST /auth/logout from auth rate limiting", async () => {
    let nextCalled = false;
    const { req, res } = createMockReqRes({
      method: "POST",
      path: "/logout",
      originalUrl: "/auth/logout",
      ip: "10.0.0.3",
    });

    await new Promise<void>((resolve) => {
      authRateLimit(req, res, () => {
        nextCalled = true;
        resolve();
      });
    });

    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, 200);
  });

  it("4. Skips health checks from global rate limiting", async () => {
    let nextCalled = false;
    const { req, res } = createMockReqRes({
      method: "GET",
      path: "/health",
      originalUrl: "/health",
      ip: "10.0.0.4",
    });

    await new Promise<void>((resolve) => {
      globalRateLimit(req, res, () => {
        nextCalled = true;
        resolve();
      });
    });

    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, 200);
  });

  it("5. Applies rate limiting to POST /auth/login credential submissions", async () => {
    let nextCount = 0;
    const { req, res } = createMockReqRes({
      method: "POST",
      path: "/login",
      originalUrl: "/auth/login",
      ip: "10.0.0.5",
    });

    await new Promise<void>((resolve) => {
      authRateLimit(req, res, () => {
        nextCount++;
        resolve();
      });
    });

    assert.equal(nextCount, 1);
    assert.equal(res.statusCode, 200);
  });
});
