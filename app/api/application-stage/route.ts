// app/api/application-stage/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCandidateStageUpdatedEmail } from "@/lib/email";

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

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { stage },
      include: {
        job: {
          select: {
            title: true,
          },
        },
        candidate: {
          select: {
            email: true,
            fullname: true,
          },
        },
      },
    });

    // Send candidate email (if we have an address)
    try {
      const to = updated.candidate?.email;
      if (to) {
        await sendCandidateStageUpdatedEmail({
          to,
          candidateName: updated.candidate?.fullname || undefined,
          jobTitle: updated.job?.title || "your application",
          newStage: stage,
        });
      }
    } catch (err) {
      console.error("Error sending stage update email:", err);
    }

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
