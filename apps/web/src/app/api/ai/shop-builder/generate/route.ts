import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/urls";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiUrl = getApiUrl();

    // Call backend /ai/shop-builder/generate
    const res = await fetch(`${apiUrl}/ai/shop-builder/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.get("authorization")
          ? { Authorization: req.headers.get("authorization")! }
          : {}),
        ...(req.headers.get("cookie") ? { Cookie: req.headers.get("cookie")! } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[Next.js AI Proxy] Error forwarding request:", error);
    return NextResponse.json(
      { ok: false, message: error?.message || "Failed to generate shop" },
      { status: 500 }
    );
  }
}
