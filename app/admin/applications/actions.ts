// app/admin/applications/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateApplicationStage(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const stage = String(formData.get("stage") || "").trim();

  if (!id || !stage) {
    throw new Error("Missing fields for updating application stage");
  }

  await prisma.application.update({
    where: { id },
    data: { stage },
  });

  // Refresh the applications view
  revalidatePath("/admin/applications");
}
