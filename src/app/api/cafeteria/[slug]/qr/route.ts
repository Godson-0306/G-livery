import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/utils";
import { qrPngBuffer } from "@/lib/qr";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const cafeteria = await prisma.cafeteria.findUnique({ where: { slug } });
  if (!cafeteria) {
    return new NextResponse("Not found", { status: 404 });
  }

  const png = await qrPngBuffer(appUrl(`/cafeteria/${cafeteria.slug}`));
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="${cafeteria.slug}-menu.png"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
