// app/admin/applications/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Update the stage of an application from the list or detail view.
 */
export async function updateApplicationStage(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const stage = String(formData.get("stage") || "").trim();

  if (!id || !stage) {
    return;
  }

  await prisma.application.update({
    where: { id },
    data: { stage },
  });

  // Refresh list + detail view
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
}
