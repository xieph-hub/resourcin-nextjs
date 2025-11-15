// app/api/application-stage/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const applicationId = body?.applicationId as string | undefined;
    const stage = body?.stage as string | undefined;

    if (!applicationId || !stage) {
      return NextResponse.json(
        {
          ok: false,
          message: "applicationId and stage are required",
        },
        { status: 400 }
      );
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { stage },
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Stage updated",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update stage error:", error);

    const msg =
      error?.message || "Something went wrong while updating stage.";

    return NextResponse.json(
      {
        ok: false,
        message: msg,
      },
      { status: 500 }
    );
  }
}
