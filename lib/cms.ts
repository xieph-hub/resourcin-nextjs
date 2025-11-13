import { Client } from "@notionhq/client";
import { marked } from "marked";
import { getAllPosts as getAllFromFiles, getPost as getFromFiles } from "./insights";

const hasNotion = !!process.env.NOTION_TOKEN && !!process.env.NOTION_DATABASE_ID;

export type CMSPost = {
  slug: string;
  title: string;
  excerpt?: string;
  date?: string; // ISO
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

  // No explicit sort; some DBs may not have a Date property
  const res = await notion.databases.query({ database_id: dbId });

  const posts: CMSPost[] = res.results.map((page: any) => {
    const props = page.properties || {};

    const title =
      props?.Title?.title?.[0]?.plain_text ??
      props?.Name?.title?.[0]?.plain_text ??
      "Untitled";

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

    // Cover priority: page cover → Cover (files) → CoverURL(Optional) URL/rich_text
    let cover: string | undefined;
    if (page.cover?.external?.url) cover = page.cover.external.url;
    else if (page.cover?.file?.url) cover = page.cover.file.url;
    else {
      const files = props?.Cover?.files ?? [];
      if (files[0]?.external?.url) cover = files[0].external.url;
      if (files[0]?.file?.url) cover = files[0].file.url;
    }
    if (!cover) {
      const urlProp = props?.["CoverURL(Optional)"];
      if (urlProp?.url) cover = urlProp.url;
      const rt = urlProp?.rich_text;
      if (!cover && Array.isArray(rt) && rt[0]?.plain_text) {
        cover = rt[0].plain_text;
      }
    }

    return { slug, title, excerpt, category, date: dateISO, cover };
  });

  posts.sort((a, b) => Date.parse(b.date || "") - Date.parse(a.date || ""));
  return posts;
}

export async function getPostCMS(
  slug: string
): Promise<{ frontmatter: any; html: string } | null> {
  if (!hasNotion) {
    const file = getFromFiles(slug);
    if (!file) return null;

    // marked@12 parse may be async
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

  // --- Fetch blocks recursively (depth 2) ---
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
      for (const b of out) {
        if ((b as any).has_children) {
          (b as any)._children = await fetchChildren(b.id, depth + 1);
        }
      }
    }
    return out;
  }

  const blocks = await fetchChildren(page.id);

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const plain = (rt: any[] = []) => rt.map((t: any) => t?.plain_text ?? "").join("");

  function renderBlocks(bs: any[]): string {
    const html: string[] = [];
    let inUL = false,
      inOL = false;

    const closeLists = () => {
      if (inUL) {
        html.push("</ul>");
        inUL = false;
      }
      if (inOL) {
        html.push("</ol>");
        inOL = false;
      }
    };

    for (const b of bs) {
      const t = b.type;
      const o = (b as any)[t];
      if (!o) continue;

      const kids = (b as any)._children as any[] | undefined;
      const openKids = kids && kids.length ? `<div>${renderBlocks(kids)}</div>` : "";

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
          if (!inUL) {
            closeLists();
            html.push("<ul>");
            inUL = true;
          }
          html.push(`<li>${plain(o.rich_text)}${openKids}</li>`);
          break;

        case "numbered_list_item":
          if (!inOL) {
            closeLists();
            html.push("<ol>");
            inOL = true;
          }
          html.push(`<li>${plain(o.rich_text)}${openKids}</li>`);
          break;

        case "quote":
          closeLists();
          html.push(`<blockquote>${plain(o.rich_text)}</blockquote>`);
          break;

        case "callout": {
          closeLists();
          const icon =
            o.icon?.emoji ? o.icon.emoji : o.icon?.type ? "💡" : "";
          html.push(
            `<div class="notion-callout"><span class="notion-callout-icon">${icon}</span><div>${plain(
              o.rich_text
            )}</div>${openKids}</div>`
          );
          break;
        }

        case "toggle":
          closeLists();
          html.push(
            `<details><summary>${plain(o.rich_text)}</summary>${openKids}</details>`
          );
          break;

        case "to_do":
          closeLists();
          html.push(
            `<div class="notion-todo"><input type="checkbox" disabled ${
              o.checked ? "checked" : ""
            }/> <span>${plain(o.rich_text)}</span></div>`
          );
          break;

        case "code": {
          closeLists();
          const lang = o.language || "text";
          const code = o.rich_text?.map((r: any) => r.plain_text).join("") ?? "";
          html.push(
            `<pre><code class="language-${lang}">${esc(code)}</code></pre>`
          );
          break;
        }

        case "image": {
          closeLists();
          const src = o.type === "external" ? o.external?.url : o.file?.url;
          const cap = plain(o.caption || []);
          if (src)
            html.push(
              `<figure><img src="${src}" alt="${
                cap || ""
              }"/><figcaption>${cap || ""}</figcaption></figure>`
            );
          break;
        }

        case "divider":
          closeLists();
          html.push("<hr/>");
          break;

        // Extras
        case "bookmark": {
          closeLists();
          const url = o.url;
          html.push(
            `<p><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>`
          );
          break;
        }

        case "table": {
          closeLists();
          const rows = kids || [];
          html.push("<table>");
          for (const row of rows) {
            const cells = (row as any).table_row?.cells || [];
            html.push("<tr>");
            for (const cell of cells) {
              const text = plain(cell);
              html.push(`<td>${esc(text)}</td>`);
            }
            html.push("</tr>");
          }
          html.push("</table>");
          break;
        }

        default:
          if ((o as any)?.rich_text) {
            closeLists();
            html.push(`<p>${plain(o.rich_text)}</p>`);
          }
      }
    }
    closeLists();
    return html.join("\n");
  }

  let html = renderBlocks(blocks);

  // Fallbacks if the page body is empty:
  if (!html || html.trim().length === 0) {
    const props = page.properties || {};

    // Try your exact property and common alternates as rich_text
    const tryRich = (...keys: string[]) => {
      for (const k of keys) {
        const p = props?.[k];
        const rt = p?.rich_text;
        if (Array.isArray(rt) && rt.length) {
          const txt = rt.map((t: any) => t?.plain_text ?? "").join("");
          if (txt && txt.trim())
            return `<p>${txt.replace(/\n/g, "<br/>")}</p>`;
        }
      }
      return "";
    };

    // 1) Your exact field
    html = tryRich("Content (paste into Notion page body)");

    // 2) Common alternates
    if (!html) html = tryRich("Content", "Body");

    // 3) If it’s a URL field, link it
    if (!html) {
      const url =
        props?.["Content (paste into Notion page body)"]?.url ??
        props?.Content?.url ??
        props?.Body?.url;
      if (url) {
        html = `<p><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>`;
      }
    }
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
    cover:
      page.cover?.external?.url ||
      page.cover?.file?.url ||
      props?.["CoverURL(Optional)"]?.url ||
      (Array.isArray(props?.["CoverURL(Optional)"]?.rich_text) &&
        props?.["CoverURL(Optional)"]?.rich_text?.[0]?.plain_text) ||
      undefined,
  };

  return { frontmatter, html };
}
