import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/utils";
import { qrPngBuffer } from "@/lib/qr";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const runner = await prisma.runner.findUnique({ where: { personalSlug: slug } });
  if (!runner) {
    return new NextResponse("Not found", { status: 404 });
  }

  const png = await qrPngBuffer(appUrl(`/r/${runner.personalSlug}`));
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="${runner.personalSlug}.png"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
