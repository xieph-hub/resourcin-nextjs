"use client";
import { useEffect, useState } from "react";

export default function Dump({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/notion-dump/${params.slug}`, { cache: "no-store" });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.message || "Request failed");
        setData(j);
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, [params.slug]);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1>Notion Block Dump: {params.slug}</h1>
      {err && <pre style={{ background: "#fee", padding: 12 }}>{err}</pre>}
      {data && (
        <pre style={{ background: "#f6f8fa", padding: 12 }}>
{JSON.stringify(data, null, 2)}
        </pre>
      )}
      <p style={{ marginTop: 12 }}>Check <code>blockCount</code> and the <code>summary[].type</code> list.</p>
    </div>
  );
}
