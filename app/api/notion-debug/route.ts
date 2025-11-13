import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function GET() {
  const token = process.env.NOTION_TOKEN;
  const db = process.env.NOTION_DATABASE_ID;

  if (!token || !db) {
    return NextResponse.json(
      {
        ok: false,
        step: "env",
        message: "Missing NOTION_TOKEN or NOTION_DATABASE_ID",
        haveToken: !!token,
        haveDatabaseId: !!db,
      },
      { status: 400 }
    );
  }

  try {
    const notion = new Client({ auth: token });
    const res = await notion.databases.query({
      database_id: db,
      page_size: 5,
      sorts: [{ property: "Date", direction: "descending" }],
    });

    // Try to parse a few common fields
    const items = res.results.map((page: any) => ({
      id: page.id,
      title: page.properties?.Title?.title?.[0]?.plain_text ?? null,
      slug: page.properties?.Slug?.rich_text?.[0]?.plain_text ?? null,
      date: page.properties?.Date?.date?.start ?? null,
      category:
        page.properties?.Category?.select?.name ??
        page.properties?.Category?.rich_text?.[0]?.plain_text ??
        null,
    }));

    return NextResponse.json({
      ok: true,
      step: "query",
      databaseId: db,
      count: res.results.length,
      sample: items,
      hint: "If slug is null, add a 'Slug' rich text property. If title is null, set a Title.",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        step: "query",
        message: err?.message || String(err),
        note:
          "Common causes: integration not connected to this database; wrong workspace; wrong database_id; property names don't match (Title, Slug, Date, Category).",
      },
      { status: 500 }
    );
  }
}
