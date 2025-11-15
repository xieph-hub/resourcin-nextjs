"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateApplicationStage(formData: FormData) {
  const id = formData.get("id") as string;
  const stage = formData.get("stage") as string;

  if (!id || !stage) return;

  await prisma.application.update({
    where: { id },
    data: {
      stage: stage as any, // enum value on Application
    },
  });

  // Refresh the detail page and the list page
  revalidatePath(`/admin/applications/${id}`);
  revalidatePath(`/admin/applications`);
}
