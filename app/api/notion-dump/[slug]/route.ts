import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const token = process.env.NOTION_TOKEN;
  const db = process.env.NOTION_DATABASE_ID;
  if (!token || !db) {
    return NextResponse.json(
      { ok: false, step: "env", message: "Missing NOTION_TOKEN or NOTION_DATABASE_ID" },
      { status: 400 }
    );
  }
  const notion = new Client({ auth: token });

  // find page by Slug
  const found = await notion.databases.query({
    database_id: db,
    filter: { property: "Slug", rich_text: { equals: params.slug } },
    page_size: 1,
  });
  const page = found.results[0] as any;
  if (!page) {
    return NextResponse.json({ ok: false, step: "lookup", message: "No page for slug" }, { status: 404 });
  }

  // fetch first-level children
  const blocks: any[] = [];
  let cursor: string | undefined;
  do {
    const r = await notion.blocks.children.list({
      block_id: page.id,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...r.results);
    cursor = r.has_more ? (r.next_cursor as string) : undefined;
  } while (cursor);

  // return summary (types + has_children)
  const summary = blocks.map((b: any) => ({
    id: b.id,
    type: b.type,
    has_children: !!b.has_children,
    rt: (b[b.type]?.rich_text || []).map((t: any) => t?.plain_text ?? ""),
  }));

  return NextResponse.json({
    ok: true,
    slug: params.slug,
    blockCount: blocks.length,
    summary,
  });
}
