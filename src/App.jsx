import { useEffect, useMemo, useState } from "react";
import SearchBar from "./components/SearchBar/SearchBar.jsx";
import EpisodeCard from "./components/EpisodeCard/EpisodeCard.jsx";
import ActorCard from "./components/ActorCard/ActorCard.jsx";
import { fetchActors, fetchEpisodes } from "./services/api.js";
import "./App.scss";

export default function App() {
  const [episodesQuery, setEpisodesQuery] = useState("");
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodesErr, setEpisodesErr] = useState("");
  const [episodesItems, setEpisodesItems] = useState([]);
  const [actorsQuery, setActorsQuery] = useState("");
  const [actorsLoading, setActorsLoading] = useState(false);
  const [actorsErr, setActorsErr] = useState("");
  const [actorsItems, setActorsItems] = useState([]);
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
    const route = isActorsPage ? "/actors" : "/episodes";
    const u = new URL(route, base.startsWith("http") ? base : "https://example.com");
    const qq = (isActorsPage ? actorsQuery : episodesQuery).trim();
    if (qq) u.searchParams.set("q", qq);
    return base.startsWith("http") ? u.toString() : base;
  }, [actorsQuery, episodesQuery, isActorsPage]);

  function getStateFor(route) {
    if (route === "actors") {
      return {
        query: actorsQuery,
        setItems: setActorsItems,
        setLoading: setActorsLoading,
        setErr: setActorsErr,
      };
    }

    return {
      query: episodesQuery,
      setItems: setEpisodesItems,
      setLoading: setEpisodesLoading,
      setErr: setEpisodesErr,
    };
  }

  async function runSearch(e, route = isActorsPage ? "actors" : "episodes") {
    e?.preventDefault();
    const { query, setItems, setLoading, setErr } = getStateFor(route);
    setLoading(true);
    setErr("");
    try {
      const data =
        route === "actors" ? await fetchActors({ q: query }) : await fetchEpisodes({ q: query });
      setItems(data);
    } catch (ex) {
      setErr(ex.message || String(ex));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isActorsPage) {
      runSearch(null, "actors");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActorsPage]);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Chespirito — Busca de episódios</h1>
        <div className="app__hint">Dica: deixe vazio e clique Buscar para listar tudo.</div>
        <nav className="app__nav">
          <a
            className="app__nav-link"
            href="/"
            aria-current={!isActorsPage ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              navigate("/");
            }}
          >
            Episódios
          </a>
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

      <SearchBar
        value={isActorsPage ? actorsQuery : episodesQuery}
        onChange={isActorsPage ? setActorsQuery : setEpisodesQuery}
        onSubmit={runSearch}
        loading={isActorsPage ? actorsLoading : episodesLoading}
        placeholder={
          isActorsPage
            ? "Digite: churros, barril, elenco… (vazio = lista tudo)"
            : "Digite: florinda, renta, aluguel, torta de jamón… (vazio = lista tudo)"
        }
      />

      <div className="app__endpoint">
        Endpoint: <code>{endpointPreview}</code>
      </div>

      {(isActorsPage ? actorsErr : episodesErr) && (
        <div className="app__error">Erro: {isActorsPage ? actorsErr : episodesErr}</div>
      )}

      {isActorsPage ? (
        <main className="app__results">
          {!actorsLoading && !actorsErr && actorsItems.length === 0 && (
            <div className="app__empty">Nenhum ator encontrado.</div>
          )}

          {actorsItems.map((actor, index) => (
            <ActorCard key={actor.id ?? actor.name ?? index} actor={actor} />
          ))}
        </main>
      ) : (
        <main className="app__results">
          {!episodesLoading && !episodesErr && episodesItems.length === 0 && (
            <div className="app__empty">Nenhum resultado.</div>
          )}

          {episodesItems.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} />
          ))}
        </main>
      )}
    </div>
  );
}
