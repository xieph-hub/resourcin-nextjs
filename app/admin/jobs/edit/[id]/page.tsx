// app/admin/jobs/edit/[id]/page.tsx
import { prisma } from "@/lib/db";
import Container from "@/components/Container";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { key?: string };
}) {
  const key = searchParams.key ?? "";
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return notFound();

  return (
    <section className="py-12 md:py-20">
      <Container>
        <h1 className="text-2xl font-bold">Edit Job</h1>
        <form
          className="mt-6 grid gap-3"
          action={`/api/admin/jobs/update?key=${encodeURIComponent(key)}`}
          method="post"
        >
          <input type="hidden" name="id" value={job.id} />
          <label className="text-sm">Title</label>
          <input name="title" defaultValue={job.title} className="border rounded-xl p-3" required />
          <label className="text-sm">Slug</label>
          <input name="slug" defaultValue={job.slug} className="border rounded-xl p-3" required />
          <label className="text-sm">Department</label>
          <input name="department" defaultValue={job.department || ""} className="border rounded-xl p-3" />
          <label className="text-sm">Location</label>
          <input name="location" defaultValue={job.location || ""} className="border rounded-xl p-3" />
          <label className="text-sm">Type</label>
          <input name="type" defaultValue={job.type || ""} className="border rounded-xl p-3" />
          <label className="text-sm">Excerpt</label>
          <textarea name="excerpt" defaultValue={job.excerpt || ""} className="border rounded-xl p-3 min-h-[80px]" />
          <label className="text-sm">Description (HTML)</label>
          <textarea name="description" defaultValue={job.description} className="border rounded-xl p-3 min-h-[200px]" required />
          <button className="px-5 py-3 rounded-xl bg-[#172965] text-white hover:opacity-90">Save Changes</button>
        </form>
      </Container>
    </section>
  );
}
