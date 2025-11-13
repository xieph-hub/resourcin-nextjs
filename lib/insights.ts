import fs from "fs";
import path from "path";
import matter from "gray-matter";

type DateLike = string | Date | undefined;

export type Post = {
  slug: string;
  title: string;
  excerpt?: string;
  /** ISO string used for rendering/sorting */
  date?: string;
  category?: string;
  cover?: string;
};

const insightsDir = path.join(process.cwd(), "content", "insights");

function toISO(d: DateLike): string | undefined {
  if (!d) return undefined;
  if (d instanceof Date) return isNaN(d.getTime()) ? undefined : d.toISOString();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(insightsDir)) return [];
  const files = fs.readdirSync(insightsDir).filter((f) => f.endsWith(".md"));

  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const filePath = path.join(insightsDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    const title = (data.title as string) ?? slug;
    const excerpt =
      (data.excerpt as string) ??
      (content || "").slice(0, 160).replace(/\n/g, " ") + (content.length > 160 ? "..." : "");

    const dateISO = toISO(data.date as DateLike);

    return {
      slug,
      title,
      excerpt,
      date: dateISO,
      category: (data.category as string) ?? undefined,
      cover: (data.cover as string) ?? undefined,
    } as Post;
  });

  // sort newest first; undated posts go last
  return posts.sort((a, b) => {
    const aTime = a.date ? Date.parse(a.date) : -Infinity;
    const bTime = b.date ? Date.parse(b.date) : -Infinity;
    return bTime - aTime;
  });
}

export function getPost(slug: string): { frontmatter: any; content: string } | null {
  const filePath = path.join(insightsDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { frontmatter: data, content };
}
