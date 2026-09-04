import type { Page, Response } from "@playwright/test";

export interface NetworkFailure {
  url: string;
  method: string;
  status: number;
  statusText: string;
}

export interface PageAuditMonitor {
  consoleErrors: string[];
  chunkErrors: string[];
  hydrationErrors: string[];
  uncaughtExceptions: string[];
  failedRequests: NetworkFailure[];
  apiRequests: { url: string; method: string; status: number }[];
  clear(): void;
  getSummary(): {
    hasChunkErrors: boolean;
    hasHydrationErrors: boolean;
    hasExceptions: boolean;
    hasFailedApi: boolean;
  };
}

export function attachPageMonitor(page: Page): PageAuditMonitor {
  const monitor: PageAuditMonitor = {
    consoleErrors: [],
    chunkErrors: [],
    hydrationErrors: [],
    uncaughtExceptions: [],
    failedRequests: [],
    apiRequests: [],
    clear() {
      this.consoleErrors = [];
      this.chunkErrors = [];
      this.hydrationErrors = [];
      this.uncaughtExceptions = [];
      this.failedRequests = [];
      this.apiRequests = [];
    },
    getSummary() {
      return {
        hasChunkErrors: this.chunkErrors.length > 0,
        hasHydrationErrors: this.hydrationErrors.length > 0,
        hasExceptions: this.uncaughtExceptions.length > 0,
        hasFailedApi: this.failedRequests.some((r) => r.status >= 500),
      };
    },
  };

  page.on("console", (msg) => {
    const text = msg.text();
    const type = msg.type();

    if (type === "error") {
      monitor.consoleErrors.push(text);

      if (
        text.includes("ChunkLoadError") ||
        text.includes("Loading chunk") ||
        text.includes("Loading CSS chunk") ||
        text.includes("Failed to load resource") && text.includes("_next/static/chunks")
      ) {
        monitor.chunkErrors.push(text);
      }

      if (
        text.includes("Hydration failed") ||
        text.includes("There was an error while hydrating") ||
        text.includes("did not match") ||
        text.includes("Minified React error #418") ||
        text.includes("Minified React error #423")
      ) {
        monitor.hydrationErrors.push(text);
      }
    }
  });

  page.on("pageerror", (err) => {
    const msg = err.message || String(err);
    monitor.uncaughtExceptions.push(msg);

    if (
      msg.includes("ChunkLoadError") ||
      msg.includes("Loading chunk") ||
      msg.includes("Loading CSS chunk")
    ) {
      monitor.chunkErrors.push(msg);
    }
  });

  page.on("response", (res: Response) => {
    const url = res.url();
    const status = res.status();
    const method = res.request().method();

    if (url.includes("/api/") || url.includes(":4000/")) {
      monitor.apiRequests.push({ url, method, status });
      if (status >= 400) {
        // Some 404s can be expected (e.g. store logo not set), filter out benign 404s
        const isBenign =
          status === 404 &&
          (url.includes("/avatar") || url.includes("/favicon") || url.includes("/logo"));
        if (!isBenign) {
          monitor.failedRequests.push({
            url,
            method,
            status,
            statusText: res.statusText(),
          });
        }
      }
    } else if (url.includes("_next/static/chunks") && status >= 400) {
      monitor.chunkErrors.push(`Failed chunk request: ${url} (${status})`);
    }
  });

  return monitor;
}
