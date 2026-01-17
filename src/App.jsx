import { useEffect, useMemo, useState } from "react";
import SearchBar from "./components/SearchBar/SearchBar.jsx";
import EpisodeCard from "./components/EpisodeCard/EpisodeCard.jsx";
import { fetchEpisodes } from "./services/api.js";
import "./App.scss";

export default function App() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(to) {
    if (to === window.location.pathname) return;
    window.history.pushState({}, "", to);
    setPath(to);
  }

  const isActorsPage = path === "/actors";

  const endpointPreview = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE_URL || "(missing VITE_API_BASE_URL)";
    const u = new URL("/episodes", base.startsWith("http") ? base : "https://example.com");
    const qq = q.trim();
    if (qq) u.searchParams.set("q", qq);
    return base.startsWith("http") ? u.toString() : base;
  }, [q]);

  async function runSearch(e) {
    e?.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const data = await fetchEpisodes({ q });
      setItems(data);
    } catch (ex) {
      setErr(ex.message || String(ex));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Chespirito — Busca de episódios</h1>
        <div className="app__hint">Dica: deixe vazio e clique Buscar para listar tudo.</div>
        <nav className="app__nav">
          <a
            className="app__nav-link"
            href="/actors"
            aria-current={isActorsPage ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              navigate("/actors");
            }}
          >
            Atores
          </a>
        </nav>
      </header>

      {isActorsPage ? (
        <main className="page">
          <h2 className="page__title">Atores</h2>
          <p className="page__hint">Em breve.</p>
        </main>
      ) : (
        <>
          <SearchBar value={q} onChange={setQ} onSubmit={runSearch} loading={loading} />

          <div className="app__endpoint">
            Endpoint: <code>{endpointPreview}</code>
          </div>

          {err && <div className="app__error">Erro: {err}</div>}

          <main className="app__results">
            {!loading && !err && items.length === 0 && (
              <div className="app__empty">Nenhum resultado.</div>
            )}

            {items.map((ep) => (
              <EpisodeCard key={ep.id} episode={ep} />
            ))}
          </main>
        </>
      )}
    </div>
  );
}
