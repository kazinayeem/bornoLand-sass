import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/urls";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiUrl = getApiUrl();

    const res = await fetch(`${apiUrl}/ai/shop-builder/improve-section`, {
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
    return NextResponse.json(
      { ok: false, message: error?.message || "Failed to improve section" },
      { status: 500 }
    );
  }
}
