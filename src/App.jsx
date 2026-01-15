import { useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL; // ex: https://xxxx.execute-api.us-east-1.amazonaws.com/prod

export default function App() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  const endpoint = useMemo(() => {
    const url = new URL(`${API_BASE}/episodes`);
    const qq = q.trim();
    if (qq) url.searchParams.set("q", qq);
    return url.toString();
  }, [q]);

  async function runSearch(e) {
    e?.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (ex) {
      setErr(ex.message || String(ex));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        padding: 24,
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginTop: 0 }}>Chespirito — Busca de episódios</h1>

      <form onSubmit={runSearch} style={{ display: "flex", gap: 8 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Digite: florinda, renta, aluguel, torta de jamón… (vazio = lista tudo)"
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Buscar
        </button>
      </form>

      <div style={{ marginTop: 12, color: "#666" }}>
        Endpoint: <code>{endpoint}</code>
      </div>

      {loading && <div style={{ marginTop: 12 }}>Carregando…</div>}
      {err && (
        <div style={{ marginTop: 12, color: "crimson" }}>Erro: {err}</div>
      )}

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {!loading && !err && items.length === 0 && (
          <div
            style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}
          >
            Nenhum resultado.
          </div>
        )}

        {items.map((e) => (
          <div
            key={e.id}
            style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "baseline",
                flexWrap: "wrap",
              }}
            >
              <strong style={{ fontSize: 18 }}>{e.title}</strong>
              <span style={{ color: "#666" }}>({e.titleEs})</span>
            </div>

            {/* Badges de personagens */}
            {Array.isArray(e.characters) && e.characters.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {e.characters.map((c) => (
                  <span
                    key={c.id ?? c.name}
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: 999,
                      border: "1px solid #ddd",
                      background: "#f7f7f7",
                      fontSize: 13,
                      color: "#242424",
                    }}
                    title={c.name}
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            )}

            <div style={{ color: "#666", marginTop: 8 }}>
              Temporada {e.season} • Ep {e.episodeNumber} • {e.airDate ?? "—"}
            </div>

            <div style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>
              {e.synopsisPt}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
