import { useEffect, useMemo, useState } from "react";
import SearchBar from "./components/SearchBar/SearchBar.jsx";
import EpisodeCard from "./components/EpisodeCard/EpisodeCard.jsx";
import ActorCard from "./components/ActorCard/ActorCard.jsx";
import CharacterCard from "./components/CharacterCard/CharacterCard.jsx";
import CharacterModal from "./components/CharacterModal/CharacterModal.jsx";
import { fetchActors, fetchCharacters, fetchEpisodes, fetchEpisodesByCharacter } from "./services/api.js";
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
  const [charactersQuery, setCharactersQuery] = useState("");
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [charactersErr, setCharactersErr] = useState("");
  const [charactersItems, setCharactersItems] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterEpisodes, setCharacterEpisodes] = useState([]);
  const [characterEpisodesLoading, setCharacterEpisodesLoading] = useState(false);
  const [characterEpisodesErr, setCharacterEpisodesErr] = useState("");
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
    setSelectedCharacter(null);
  }

  const isActorsPage = path === "/actors";
  const isCharactersPage = path === "/characters";

  const endpointPreview = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE_URL || "(missing VITE_API_BASE_URL)";
    const route = isActorsPage ? "/actors" : isCharactersPage ? "/characters" : "/episodes";
    const u = new URL(route, base.startsWith("http") ? base : "https://example.com");
    const qq = (isActorsPage ? actorsQuery : isCharactersPage ? charactersQuery : episodesQuery).trim();
    if (qq) u.searchParams.set("q", qq);
    return base.startsWith("http") ? u.toString() : base;
  }, [actorsQuery, charactersQuery, episodesQuery, isActorsPage, isCharactersPage]);

  function getStateFor(route) {
    if (route === "actors") {
      return {
        query: actorsQuery,
        setItems: setActorsItems,
        setLoading: setActorsLoading,
        setErr: setActorsErr,
      };
    }

    if (route === "characters") {
      return {
        query: charactersQuery,
        setItems: setCharactersItems,
        setLoading: setCharactersLoading,
        setErr: setCharactersErr,
      };
    }

    return {
      query: episodesQuery,
      setItems: setEpisodesItems,
      setLoading: setEpisodesLoading,
      setErr: setEpisodesErr,
    };
  }

  async function runSearch(
    e,
    route = isActorsPage ? "actors" : isCharactersPage ? "characters" : "episodes",
  ) {
    e?.preventDefault();
    const { query, setItems, setLoading, setErr } = getStateFor(route);
    setLoading(true);
    setErr("");
    try {
      const data =
        route === "actors"
          ? await fetchActors({ q: query })
          : route === "characters"
          ? await fetchCharacters({ q: query })
          : await fetchEpisodes({ q: query });
      setItems(data);
    } catch (ex) {
      setErr(ex.message || String(ex));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isActorsPage) runSearch(null, "actors");
    if (isCharactersPage) runSearch(null, "characters");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActorsPage, isCharactersPage]);

  useEffect(() => {
    if (!selectedCharacter) return;
    if (!selectedCharacter.id) {
      setCharacterEpisodes([]);
      setCharacterEpisodesErr("Personagem sem identificador.");
      return;
    }

    let isActive = true;
    setCharacterEpisodes([]);
    setCharacterEpisodesErr("");
    setCharacterEpisodesLoading(true);

    fetchEpisodesByCharacter({ characterId: selectedCharacter.id })
      .then((data) => {
        if (!isActive) return;
        setCharacterEpisodes(data);
      })
      .catch((ex) => {
        if (!isActive) return;
        setCharacterEpisodesErr(ex.message || String(ex));
      })
      .finally(() => {
        if (!isActive) return;
        setCharacterEpisodesLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [selectedCharacter]);

  useEffect(() => {
    if (!selectedCharacter) return;
    function handleKeyDown(event) {
      if (event.key === "Escape") setSelectedCharacter(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCharacter]);

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
          <a
            className="app__nav-link"
            href="/characters"
            aria-current={isCharactersPage ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              navigate("/characters");
            }}
          >
            Personagens
          </a>
        </nav>
      </header>

      <SearchBar
        value={isActorsPage ? actorsQuery : isCharactersPage ? charactersQuery : episodesQuery}
        onChange={isActorsPage ? setActorsQuery : isCharactersPage ? setCharactersQuery : setEpisodesQuery}
        onSubmit={runSearch}
        loading={isActorsPage ? actorsLoading : isCharactersPage ? charactersLoading : episodesLoading}
        placeholder={
          isActorsPage
            ? "Digite: churros, barril, elenco… (vazio = lista tudo)"
            : isCharactersPage
            ? "Digite: chaves, nhonho, barriga… (vazio = lista tudo)"
            : "Digite: florinda, renta, aluguel, torta de jamón… (vazio = lista tudo)"
        }
      />

      <div className="app__endpoint">
        Endpoint: <code>{endpointPreview}</code>
      </div>

      {(isActorsPage ? actorsErr : isCharactersPage ? charactersErr : episodesErr) && (
        <div className="app__error">
          Erro: {isActorsPage ? actorsErr : isCharactersPage ? charactersErr : episodesErr}
        </div>
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
      ) : isCharactersPage ? (
        <main className="app__results">
          {!charactersLoading && !charactersErr && charactersItems.length === 0 && (
            <div className="app__empty">Nenhum personagem encontrado.</div>
          )}

          {charactersItems.map((character, index) => (
            <CharacterCard
              key={character.id ?? character.name ?? index}
              character={character}
              onSelect={(value) => setSelectedCharacter(value)}
            />
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

      <CharacterModal
        character={selectedCharacter}
        episodes={characterEpisodes}
        loading={characterEpisodesLoading}
        error={characterEpisodesErr}
        onClose={() => setSelectedCharacter(null)}
      />
    </div>
  );
}
