import { NextRequest, NextResponse } from "next/server";
import { revalidateStorefront } from "@/lib/server/revalidate";

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.REVALIDATE_SECRET || "bornoland_revalidate_secret";
  const secret = request.headers.get("x-revalidate-secret");
  if (!secret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body?.tenantSlug) {
      return NextResponse.json({ error: "tenantSlug is required" }, { status: 400 });
    }

    await revalidateStorefront(body);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch {
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
