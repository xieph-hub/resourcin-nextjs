"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Very simple slug generator from title
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non alphanumeric
    .replace(/\s+/g, "-") // spaces to hyphen
    .replace(/-+/g, "-"); // collapse multiple hyphens
}

export async function createJob(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const department = String(formData.get("department") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const type = String(formData.get("type") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!title) {
    throw new Error("Title is required");
  }

  const slug = slugInput || slugify(title);

  // Basic safety: ensure slug is unique-ish
  const existing = await prisma.job.findUnique({
    where: { slug },
  });

  const finalSlug =
    existing && slugInput === ""
      ? `${slug}-${Date.now()}`
      : slug;

  await prisma.job.create({
    data: {
      title,
      slug: finalSlug,
      department: department || null,
      location: location || null,
      type: type || null,
      excerpt: excerpt || null,
      description: description || null,
      // postedAt & any defaults should be handled by DB if you set them there
    },
  });

  // Refresh jobs pages
  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");
}
