"use client";
import { useEffect, useState } from "react";

export default function NotionDebug() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/notion-debug", { cache: "no-store" });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.message || "Request failed");
        setData(j);
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1>Notion Debug</h1>
      <p>Checks env vars, database access, and sample fields.</p>
      {err && (
        <pre style={{ background: "#fee", padding: 12, borderRadius: 8, whiteSpace: "pre-wrap" }}>
          {err}
        </pre>
      )}
      {data && (
        <pre style={{ background: "#f6f8fa", padding: 12, borderRadius: 8, whiteSpace: "pre-wrap" }}>
{JSON.stringify(data, null, 2)}
        </pre>
      )}
      <p style={{ marginTop: 12, color: "#555" }}>
        Expect <code>ok: true</code>. If not, read the <code>step</code> and <code>message</code>.
      </p>
    </div>
  );
}
