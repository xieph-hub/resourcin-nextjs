import { Client } from "@notionhq/client";
import { marked } from "marked";
import { getAllPosts as getAllFromFiles, getPost as getFromFiles } from "./insights";

const hasNotion = !!process.env.NOTION_TOKEN && !!process.env.NOTION_DATABASE_ID;

export type CMSPost = {
  slug: string;
  title: string;
  excerpt?: string;
  date?: string;       // ISO
  category?: string;
  cover?: string;
  html?: string;
};

function toISO(input: any): string | undefined {
  if (!input) return undefined;
  const d = new Date(input);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export async function getAllPostsCMS(): Promise<CMSPost[]> {
  if (!hasNotion) {
    return getAllFromFiles().map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: p.date,
      category: p.category,
      cover: p.cover,
    }));
  }

  const notion = new Client({ auth: process.env.NOTION_TOKEN! });
  const dbId = process.env.NOTION_DATABASE_ID!;

  // No explicit sort (DB may not have a "Date" property)
  const res = await notion.databases.query({ database_id: dbId });

  const posts: CMSPost[] = res.results.map((page: any) => {
    const props = page.properties || {};
    const title = props?.Title?.title?.[0]?.plain_text ?? "Untitled";
    const slug =
      props?.Slug?.rich_text?.[0]?.plain_text ??
      title.toLowerCase().replace(/\s+/g, "-");
    const excerpt = props?.Excerpt?.rich_text?.[0]?.plain_text ?? "";
    const category =
      props?.Category?.select?.name ??
      props?.Category?.rich_text?.[0]?.plain_text ??
      undefined;

    // Prefer explicit Date; fallback to last_edited_time
    const dateRaw = props?.Date?.date?.start ?? page.last_edited_time;
    const dateISO = toISO(dateRaw);

    // Cover: page cover first, property second
    let cover: string | undefined;
    if (page.cover?.external?.url) cover = page.cover.external.url;
    else if (page.cover?.file?.url) cover = page.cover.file.url;
    else {
      const files = props?.Cover?.files ?? [];
      if (files[0]?.external?.url) cover = files[0].external.url;
      if (files[0]?.file?.url) cover = files[0].file.url;
    }

    return { slug, title, excerpt, category, date: dateISO, cover };
  });

  // Sort newest first
  posts.sort((a, b) => Date.parse(b.date || "") - Date.parse(a.date || ""));
  return posts;
}

export async function getPostCMS(
  slug: string
): Promise<{ frontmatter: any; html: string } | null> {
  if (!hasNotion) {
    const file = getFromFiles(slug);
    if (!file) return null;
    const htmlParsed = await marked.parse(file.content ?? "");
    const html = typeof htmlParsed === "string" ? htmlParsed : String(htmlParsed);
    return { frontmatter: file.frontmatter, html };
  }

  const notion = new Client({ auth: process.env.NOTION_TOKEN! });
  const dbId = process.env.NOTION_DATABASE_ID!;

  // Find the page by Slug exact match
  const found = await notion.databases.query({
    database_id: dbId,
    filter: { property: "Slug", rich_text: { equals: slug } },
    page_size: 1,
  });

  const page = found.results[0] as any;
  if (!page) return null;

  // --- Fetch all blocks (recursively up to depth 2 to handle toggles/lists/code) ---
  async function fetchChildren(blockId: string, depth = 0): Promise<any[]> {
    const out: any[] = [];
    let cursor: string | undefined;
    do {
      const r = await notion.blocks.children.list({
        block_id: blockId,
        start_cursor: cursor,
        page_size: 100,
      });
      out.push(...r.results);
      cursor = r.has_more ? (r.next_cursor as string) : undefined;
    } while (cursor);

    if (depth < 2) {
      // recursively fetch children for blocks that have them
      for (const b of out) {
        if ((b as any).has_children) {
          (b as any)._children = await fetchChildren(b.id, depth + 1);
        }
      }
    }
    return out;
  }

  const blocks = await fetchChildren(page.id);

  const plain = (rt: any[] = []) => rt.map((t: any) => t?.plain_text ?? "").join("");

  // Group adjacent list items into <ul>/<ol>
  function renderBlocks(bs: any[]): string {
    const html: string[] = [];
    let inUL = false;
    let inOL = false;

    const closeLists = () => {
      if (inUL) { html.push("</ul>"); inUL = false; }
      if (inOL) { html.push("</ol>"); inOL = false; }
    };

    for (const b of bs) {
      const t = b.type;
      const o = (b as any)[t];
      if (!o) continue;

      const openChildren = (kids?: any[]) =>
        kids && kids.length ? `<div>${renderBlocks(kids)}</div>` : "";

      switch (t) {
        case "paragraph":
          closeLists();
          html.push(`<p>${plain(o.rich_text)}</p>`);
          break;

        case "heading_1":
          closeLists();
          html.push(`<h1>${plain(o.rich_text)}</h1>`);
          break;

        case "heading_2":
          closeLists();
          html.push(`<h2>${plain(o.rich_text)}</h2>`);
          break;

        case "heading_3":
          closeLists();
          html.push(`<h3>${plain(o.rich_text)}</h3>`);
          break;

        case "bulleted_list_item":
          if (!inUL) { closeLists(); html.push("<ul>"); inUL = true; }
          html.push(`<li>${plain(o.rich_text)}${openChildren((b as any)._children)}</li>`);
          break;

        case "numbered_list_item":
          if (!inOL) { closeLists(); html.push("<ol>"); inOL = true; }
          html.push(`<li>${plain(o.rich_text)}${openChildren((b as any)._children)}</li>`);
          break;

        case "quote":
          closeLists();
          html.push(`<blockquote>${plain(o.rich_text)}</blockquote>`);
          break;

        case "callout": {
          closeLists();
          const text = plain(o.rich_text);
          const icon =
            o.icon?.emoji ? o.icon.emoji :
            o.icon?.type === "external" ? "💡" :
            o.icon?.type === "file" ? "💡" : "";
          html.push(
            `<div class="notion-callout"><span class="notion-callout-icon">${icon}</span><div>${text}</div>${openChildren((b as any)._children)}</div>`
          );
          break;
        }

        case "toggle":
          closeLists();
          html.push(
            `<details><summary>${plain(o.rich_text)}</summary>${openChildren((b as any)._children)}</details>`
          );
          break;

        case "to_do":
          closeLists();
          html.push(
            `<div class="notion-todo"><input type="checkbox" disabled ${o.checked ? "checked" : ""}/> <span>${plain(
              o.rich_text
            )}</span></div>`
          );
          break;

        case "code": {
          closeLists();
          const lang = o.language || "text";
          const code = o.rich_text?.map((r: any) => r.plain_text).join("") ?? "";
          html.push(`<pre><code class="language-${lang}">${code.replace(/</g, "&lt;")}</code></pre>`);
          break;
        }

        case "image": {
          closeLists();
          const src = o.type === "external" ? o.external?.url : o.file?.url;
          const cap = plain(o.caption || []);
          if (src) {
            html.push(
              `<figure><img src="${src}" alt="${cap || ""}"/><figcaption>${cap || ""}</figcaption></figure>`
            );
          }
          break;
        }

        case "divider":
          closeLists();
          html.push("<hr/>");
          break;

        default:
          // Fallback: render any rich_text as a paragraph
          if ((o as any)?.rich_text) {
            closeLists();
            html.push(`<p>${plain(o.rich_text)}</p>`);
          }
      }
    }
    closeLists();
    return html.join("\n");
  }

  const contentHTML = renderBlocks(blocks);

  // Fallback: if page body is empty, try a 'Content' property (rich_text) if you used one
  let finalHTML = contentHTML && contentHTML.trim().length > 0 ? contentHTML : "";
  if (!finalHTML) {
    const props = page.properties || {};
    const rich = props?.Content?.rich_text || props?.Body?.rich_text || [];
    const txt = plain(rich);
    if (txt) finalHTML = `<p>${txt.replace(/\n/g, "<br/>")}</p>`;
  }

  const props = page.properties || {};
  const frontmatter = {
    title:
      props?.Title?.title?.[0]?.plain_text ??
      props?.Name?.title?.[0]?.plain_text ??
      "Untitled",
    category:
      props?.Category?.select?.name ??
      props?.Category?.rich_text?.[0]?.plain_text ??
      undefined,
    date: props?.Date?.date?.start ?? page.last_edited_time ?? undefined,
    cover: page.cover?.external?.url || page.cover?.file?.url || undefined,
  };

  return { frontmatter, html: finalHTML };
}
