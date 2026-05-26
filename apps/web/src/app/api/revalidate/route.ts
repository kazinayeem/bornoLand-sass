import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = req.headers.get("x-revalidate-token") || body?.token;
    // If secret is configured, require it
    if (process.env.REVALIDATE_SECRET && token !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const slug = body?.slug as string | undefined;
    const pageId = body?.pageId as string | undefined;

    if (!slug && !pageId) {
      return NextResponse.json({ ok: false, message: "slug or pageId required" }, { status: 400 });
    }

    // revalidate storefront paths
    if (slug) {
      // Revalidate tenant homepage and shop paths
      revalidatePath(`/site/${slug}`);
      revalidatePath(`/site/${slug}/shop`);
      revalidateTag(`tenant-site:${slug}`);
      revalidateTag(`store-home:${slug}`);
    }

    // revalidate generic site listing if pageId provided
    if (pageId) {
      // best-effort: revalidate all tenant homepages (soft)
      // callers should provide slug where possible
      revalidatePath(`/`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, message: (err as Error).message }, { status: 500 });
  }
}
