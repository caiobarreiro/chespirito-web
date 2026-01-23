import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SearchBar from "./components/SearchBar/SearchBar.jsx";
import EpisodeCard from "./components/EpisodeCard/EpisodeCard.jsx";
import ActorCard from "./components/ActorCard/ActorCard.jsx";
import CharacterCard from "./components/CharacterCard/CharacterCard.jsx";
import ShowCard from "./components/ShowCard/ShowCard.jsx";
import CharacterModal from "./components/CharacterModal/CharacterModal.jsx";
import EpisodeModal from "./components/EpisodeModal/EpisodeModal.jsx";
import ShowModal from "./components/ShowModal/ShowModal.jsx";
import ActorModal from "./components/ActorModal/ActorModal.jsx";
import ActorDetailsModal from "./components/ActorDetailsModal/ActorDetailsModal.jsx";
import AddCharacterModal from "./components/AddCharacterModal/AddCharacterModal.jsx";
import EditCharacterModal from "./components/EditCharacterModal/EditCharacterModal.jsx";
import AddShowModal from "./components/AddShowModal/AddShowModal.jsx";
import AddEpisodeModal from "./components/AddEpisodeModal/AddEpisodeModal.jsx";
import {
  fetchActors,
  fetchCharacters,
  fetchEpisodes,
  fetchEpisodesByCharacter,
  fetchEpisodesByShow,
  fetchShows,
  fetchCharacter,
  createActor,
  createCharacter,
  createShow,
  createEpisode,
  updateCharacter,
  updateEpisodeCharacters,
} from "./services/api.js";
import "./App.scss";

export default function App() {
  const EPISODES_PAGE_SIZE = 20;
  const [episodesQuery, setEpisodesQuery] = useState("");
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodesPagingLoading, setEpisodesPagingLoading] = useState(false);
  const [episodesErr, setEpisodesErr] = useState("");
  const [episodesItems, setEpisodesItems] = useState([]);
  const [episodesHasMore, setEpisodesHasMore] = useState(true);
  const [episodesPaginationActive, setEpisodesPaginationActive] = useState(false);
  const [actorsQuery, setActorsQuery] = useState("");
  const [actorsLoading, setActorsLoading] = useState(false);
  const [actorsErr, setActorsErr] = useState("");
  const [actorsItems, setActorsItems] = useState([]);
  const [charactersQuery, setCharactersQuery] = useState("");
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [charactersErr, setCharactersErr] = useState("");
  const [charactersItems, setCharactersItems] = useState([]);
  const [showsQuery, setShowsQuery] = useState("");
  const [showsLoading, setShowsLoading] = useState(false);
  const [showsErr, setShowsErr] = useState("");
  const [showsItems, setShowsItems] = useState([]);
  const [selectedActor, setSelectedActor] = useState(null);
  const [actorModalReturn, setActorModalReturn] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [episodeModalReturn, setEpisodeModalReturn] = useState(null);
  const characterFetchIdRef = useRef(0);
  const [characterEpisodes, setCharacterEpisodes] = useState([]);
  const [characterEpisodesLoading, setCharacterEpisodesLoading] = useState(false);
  const [characterEpisodesErr, setCharacterEpisodesErr] = useState("");
  const [characterDetailsErr, setCharacterDetailsErr] = useState("");
  const [selectedShow, setSelectedShow] = useState(null);
  const [showEpisodes, setShowEpisodes] = useState([]);
  const [showEpisodesLoading, setShowEpisodesLoading] = useState(false);
  const [showEpisodesErr, setShowEpisodesErr] = useState("");
  const [path, setPath] = useState(window.location.pathname);
  const [isActorModalOpen, setIsActorModalOpen] = useState(false);
  const [actorCreateErr, setActorCreateErr] = useState("");
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [characterCreateErr, setCharacterCreateErr] = useState("");
  const [isEditCharacterModalOpen, setIsEditCharacterModalOpen] = useState(false);
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const [showCreateErr, setShowCreateErr] = useState("");
  const [characterActors, setCharacterActors] = useState([]);
  const [characterActorsLoading, setCharacterActorsLoading] = useState(false);
  const [characterActorsErr, setCharacterActorsErr] = useState("");
  const [selectedEpisodeShowKey, setSelectedEpisodeShowKey] = useState("all");
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [episodeCreateErr, setEpisodeCreateErr] = useState("");
  const [episodeShows, setEpisodeShows] = useState([]);
  const [episodeShowsLoading, setEpisodeShowsLoading] = useState(false);
  const [episodeShowsErr, setEpisodeShowsErr] = useState("");
  const [episodeCharacters, setEpisodeCharacters] = useState([]);
  const [episodeCharactersLoading, setEpisodeCharactersLoading] = useState(false);
  const [episodeCharactersErr, setEpisodeCharactersErr] = useState("");
  const episodesPageRef = useRef(1);
  const episodesQueryRef = useRef("");
  const episodesFetchIdRef = useRef(0);
  const episodesLoadMoreRef = useRef(null);

  function getShowName(show) {
    return typeof show === "string" ? show : show?.name ?? show?.namePt ?? "";
  }

  function getNormalizedShowKey(show) {
    return getShowName(show).trim().toLowerCase();
  }

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
    setSelectedActor(null);
    setActorModalReturn(null);
    setSelectedCharacter(null);
    setSelectedShow(null);
  }

  const isActorsPage = path === "/actors";
  const isCharactersPage = path === "/characters";
  const isShowsPage = path === "/shows";

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

    if (route === "shows") {
      return {
        query: showsQuery,
        setItems: setShowsItems,
        setLoading: setShowsLoading,
        setErr: setShowsErr,
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
    route = isActorsPage ? "actors" : isCharactersPage ? "characters" : isShowsPage ? "shows" : "episodes",
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
          : route === "shows"
          ? await fetchShows({ q: query })
          : await fetchEpisodes({ q: query, page: 1, size: EPISODES_PAGE_SIZE });
      setItems(data);
      if (route === "episodes") {
        episodesQueryRef.current = query;
        episodesFetchIdRef.current += 1;
        episodesPageRef.current = 1;
        setEpisodesPagingLoading(false);
        setEpisodesHasMore(data.length === EPISODES_PAGE_SIZE);
        setEpisodesPaginationActive(true);
      }
    } catch (ex) {
      setErr(ex.message || String(ex));
      setItems([]);
      if (route === "episodes") {
        setEpisodesHasMore(false);
        setEpisodesPaginationActive(true);
      }
    } finally {
      setLoading(false);
    }
  }

  const loadMoreEpisodes = useCallback(async () => {
    if (!episodesPaginationActive || episodesPagingLoading || episodesLoading || !episodesHasMore) return;

    const nextPage = episodesPageRef.current + 1;
    episodesFetchIdRef.current += 1;
    const fetchId = episodesFetchIdRef.current;
    setEpisodesPagingLoading(true);
    setEpisodesErr("");

    try {
      const data = await fetchEpisodes({
        q: episodesQueryRef.current,
        page: nextPage,
        size: EPISODES_PAGE_SIZE,
      });
      if (fetchId !== episodesFetchIdRef.current) return;
      setEpisodesItems((prev) => prev.concat(data));
      episodesPageRef.current = nextPage;
      setEpisodesHasMore(data.length === EPISODES_PAGE_SIZE);
    } catch (ex) {
      if (fetchId !== episodesFetchIdRef.current) return;
      setEpisodesErr(ex.message || String(ex));
    } finally {
      if (fetchId !== episodesFetchIdRef.current) return;
      setEpisodesPagingLoading(false);
    }
  }, [EPISODES_PAGE_SIZE, episodesHasMore, episodesLoading, episodesPaginationActive, episodesPagingLoading]);

  useEffect(() => {
    if (isActorsPage) runSearch(null, "actors");
    if (isCharactersPage) runSearch(null, "characters");
    if (isShowsPage) runSearch(null, "shows");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActorsPage, isCharactersPage, isShowsPage]);

  useEffect(() => {
    if (isActorsPage || isCharactersPage || isShowsPage) return;
    if (!episodesPaginationActive || !episodesHasMore) return;
    const sentinel = episodesLoadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreEpisodes();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    isActorsPage,
    isCharactersPage,
    isShowsPage,
    episodesPaginationActive,
    episodesHasMore,
    loadMoreEpisodes,
  ]);

  async function handleCreateActor(payload) {
    setActorCreateErr("");
    try {
      await createActor(payload);
      if (isActorsPage) {
        runSearch(null, "actors");
      }
    } catch (ex) {
      setActorCreateErr(ex.message || String(ex));
      throw ex;
    }
  }

  async function handleCreateCharacter(payload) {
    setCharacterCreateErr("");
    try {
      await createCharacter(payload);
      if (isCharactersPage) {
        runSearch(null, "characters");
      }
    } catch (ex) {
      setCharacterCreateErr(ex.message || String(ex));
      throw ex;
    }
  }

  async function handleUpdateCharacter(payload) {
    const updated = await updateCharacter(payload);
    const updatedCharacter = updated?.character ?? updated;
    const updatedId = updatedCharacter?.id ?? updatedCharacter?.uuid;

    setCharactersItems((prev) =>
      prev.map((character) => {
        const characterId = character?.id ?? character?.uuid;
        if (characterId && updatedId && characterId === updatedId) {
          return { ...character, ...updatedCharacter };
        }
        return character;
      }),
    );

    setSelectedCharacter((prev) => {
      const prevId = prev?.id ?? prev?.uuid;
      if (prevId && updatedId && prevId === updatedId) {
        return { ...prev, ...updatedCharacter };
      }
      return prev;
    });
  }

  async function handleCreateShow(payload) {
    setShowCreateErr("");
    try {
      await createShow(payload);
      if (isShowsPage) {
        runSearch(null, "shows");
      }
    } catch (ex) {
      setShowCreateErr(ex.message || String(ex));
      throw ex;
    }
  }

  async function handleCreateEpisode(payload) {
    setEpisodeCreateErr("");
    try {
      const { characters = [], ...episodePayload } = payload ?? {};
      const createdEpisode = await createEpisode(episodePayload);
      const episodeId = createdEpisode?.uuid ?? createdEpisode?.id;
      if (!episodeId) {
        throw new Error("Resposta da API sem identificador do episódio.");
      }
      if (Array.isArray(characters) && characters.length > 0) {
        await updateEpisodeCharacters({ episodeId, characters });
      }
      if (!isActorsPage && !isCharactersPage && !isShowsPage) {
        runSearch(null, "episodes");
      }
    } catch (ex) {
      setEpisodeCreateErr(ex.message || String(ex));
      throw ex;
    }
  }

  useEffect(() => {
    if (!isCharacterModalOpen && !isEditCharacterModalOpen) return;
    let isActive = true;
    setCharacterActorsLoading(true);
    setCharacterActorsErr("");
    fetchActors({ q: "" })
      .then((data) => {
        if (!isActive) return;
        setCharacterActors(data);
      })
      .catch((ex) => {
        if (!isActive) return;
        setCharacterActorsErr(ex.message || String(ex));
      })
      .finally(() => {
        if (!isActive) return;
        setCharacterActorsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isCharacterModalOpen, isEditCharacterModalOpen]);

  useEffect(() => {
    if (!isEpisodeModalOpen) return;
    let isActive = true;
    setEpisodeShowsLoading(true);
    setEpisodeShowsErr("");
    setEpisodeCharactersLoading(true);
    setEpisodeCharactersErr("");

    fetchShows({ q: "" })
      .then((data) => {
        if (!isActive) return;
        setEpisodeShows(data);
      })
      .catch((ex) => {
        if (!isActive) return;
        setEpisodeShowsErr(ex.message || String(ex));
      })
      .finally(() => {
        if (!isActive) return;
        setEpisodeShowsLoading(false);
      });

    fetchCharacters({ q: "" })
      .then((data) => {
        if (!isActive) return;
        setEpisodeCharacters(data);
      })
      .catch((ex) => {
        if (!isActive) return;
        setEpisodeCharactersErr(ex.message || String(ex));
      })
      .finally(() => {
        if (!isActive) return;
        setEpisodeCharactersLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isEpisodeModalOpen]);

  useEffect(() => {
    if (!selectedCharacter) return;
    const characterId = selectedCharacter.id ?? selectedCharacter.uuid;
    if (!characterId) {
      setCharacterEpisodes([]);
      setCharacterEpisodesErr("Personagem sem identificador.");
      return;
    }

    let isActive = true;
    setCharacterEpisodes([]);
    setCharacterEpisodesErr("");
    setCharacterEpisodesLoading(true);

    fetchEpisodesByCharacter({ characterId })
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
      if (event.key === "Escape") {
        setSelectedCharacter(null);
        setEpisodeModalReturn(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCharacter]);

  useEffect(() => {
    if (!selectedShow) return;
    if (!selectedShow.id) {
      setShowEpisodes([]);
      setShowEpisodesErr("Show sem identificador.");
      return;
    }

    let isActive = true;
    setShowEpisodes([]);
    setShowEpisodesErr("");
    setShowEpisodesLoading(true);

    fetchEpisodesByShow({ showId: selectedShow.id })
      .then((data) => {
        if (!isActive) return;
        setShowEpisodes(data);
      })
      .catch((ex) => {
        if (!isActive) return;
        setShowEpisodesErr(ex.message || String(ex));
      })
      .finally(() => {
        if (!isActive) return;
        setShowEpisodesLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [selectedShow]);

  const episodeShowOptions = useMemo(() => {
    const options = new Map();

    episodesItems.forEach((episode) => {
      if (!episode?.show) return;
      const label = getShowName(episode.show);
      const key = getNormalizedShowKey(episode.show);
      if (!label || !key) return;
      if (!options.has(key)) {
        options.set(key, { key, label });
      }
    });

    return Array.from(options.values());
  }, [episodesItems]);

  const episodeShowFilters = useMemo(() => {
    if (episodeShowOptions.length <= 1) return episodeShowOptions;
    return [{ key: "all", label: "Todos" }, ...episodeShowOptions];
  }, [episodeShowOptions]);

  useEffect(() => {
    if (episodeShowFilters.length === 0) {
      setSelectedEpisodeShowKey("all");
      return;
    }

    if (!episodeShowFilters.some((option) => option.key === selectedEpisodeShowKey)) {
      setSelectedEpisodeShowKey(episodeShowFilters[0].key);
    }
  }, [episodeShowFilters, selectedEpisodeShowKey]);

  const filteredEpisodes =
    selectedEpisodeShowKey && selectedEpisodeShowKey !== "all"
      ? episodesItems.filter(
          (episode) => getNormalizedShowKey(episode.show) === selectedEpisodeShowKey,
        )
      : episodesItems;

  const openCharacterModal = async (character) => {
    setCharacterDetailsErr("");
    setSelectedCharacter(character);

    const characterId = character?.id ?? character?.uuid;
    if (!characterId) return;

    characterFetchIdRef.current += 1;
    const fetchId = characterFetchIdRef.current;

    try {
      const data = await fetchCharacter({ characterId });
      if (fetchId !== characterFetchIdRef.current) return;
      setSelectedCharacter(data?.character ?? data);
    } catch (ex) {
      if (fetchId !== characterFetchIdRef.current) return;
      setCharacterDetailsErr(ex.message || String(ex));
    }
  };

  const handleCharacterSelect = (character) => {
    setEpisodeModalReturn(null);
    setActorModalReturn(null);
    setIsEditCharacterModalOpen(false);
    openCharacterModal(character);
  };

  const handleCharacterSelectFromEpisode = (character) => {
    if (selectedEpisode) {
      setEpisodeModalReturn(selectedEpisode);
      setSelectedEpisode(null);
    }
    setActorModalReturn(null);
    setIsEditCharacterModalOpen(false);
    openCharacterModal(character);
  };

  const handleCharacterSelectFromActor = (character) => {
    if (selectedActor) {
      setActorModalReturn(selectedActor);
      setSelectedActor(null);
    }
    setEpisodeModalReturn(null);
    setIsEditCharacterModalOpen(false);
    openCharacterModal(character);
  };

  const handleActorUpdated = (updatedActor) => {
    if (!updatedActor) return;
    setSelectedActor(updatedActor);
    setActorsItems((prev) =>
      prev.map((actor) => {
        const actorId = actor?.id ?? actor?.uuid;
        const updatedId = updatedActor?.id ?? updatedActor?.uuid;
        if (actorId && updatedId && actorId === updatedId) {
          return { ...actor, ...updatedActor };
        }
        return actor;
      })
    );
  };

  const handleCloseCharacterModal = () => {
    characterFetchIdRef.current += 1;
    setSelectedCharacter(null);
    setEpisodeModalReturn(null);
    setActorModalReturn(null);
    setCharacterDetailsErr("");
    setIsEditCharacterModalOpen(false);
  };

  const handleBackToEpisode = () => {
    if (!episodeModalReturn) return;
    setSelectedCharacter(null);
    setSelectedEpisode(episodeModalReturn);
    setEpisodeModalReturn(null);
    setIsEditCharacterModalOpen(false);
  };

  const handleBackToActor = () => {
    if (!actorModalReturn) return;
    setSelectedCharacter(null);
    setSelectedActor(actorModalReturn);
    setActorModalReturn(null);
    setIsEditCharacterModalOpen(false);
  };

  const characterModalBackHandler = actorModalReturn
    ? handleBackToActor
    : episodeModalReturn
    ? handleBackToEpisode
    : null;

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Chespirito — Busca de episódios</h1>
        <div className="app__hint">Dica: deixe vazio e clique Buscar para listar tudo.</div>
        <nav className="app__nav">
          <a
            className="app__nav-link"
            href="/"
            aria-current={!isActorsPage && !isCharactersPage && !isShowsPage ? "page" : undefined}
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
          <a
            className="app__nav-link"
            href="/shows"
            aria-current={isShowsPage ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              navigate("/shows");
            }}
          >
            Seriados
          </a>
        </nav>
      </header>

      <SearchBar
        value={
          isActorsPage ? actorsQuery : isCharactersPage ? charactersQuery : isShowsPage ? showsQuery : episodesQuery
        }
        onChange={
          isActorsPage
            ? setActorsQuery
            : isCharactersPage
            ? setCharactersQuery
            : isShowsPage
            ? setShowsQuery
            : setEpisodesQuery
        }
        onSubmit={runSearch}
        loading={
          isActorsPage ? actorsLoading : isCharactersPage ? charactersLoading : isShowsPage ? showsLoading : episodesLoading
        }
        placeholder={
          isActorsPage
            ? "Digite: churros, barril, elenco… (vazio = lista tudo)"
            : isCharactersPage
            ? "Digite: chaves, nhonho, barriga… (vazio = lista tudo)"
            : isShowsPage
            ? "Digite: chaves, chapolin… (vazio = lista tudo)"
            : "Digite: florinda, renta, aluguel, torta de jamón… (vazio = lista tudo)"
        }
      />

      {!isActorsPage && !isCharactersPage && !isShowsPage && episodeShowFilters.length > 1 && (
        <div className="app__show-filters" role="tablist" aria-label="Filtrar por série">
          {episodeShowFilters.map((show) => (
            <button
              key={show.key}
              className={
                show.key === selectedEpisodeShowKey
                  ? "app__show-filter app__show-filter--active"
                  : "app__show-filter"
              }
              type="button"
              role="tab"
              aria-selected={show.key === selectedEpisodeShowKey}
              onClick={() => setSelectedEpisodeShowKey(show.key)}
            >
              {show.label}
            </button>
          ))}
        </div>
      )}

      {isActorsPage && (
        <div className="app__toolbar">
          <button className="app__button" type="button" onClick={() => setIsActorModalOpen(true)}>
            Adicionar Ator
          </button>
          {actorCreateErr && <div className="app__error">Erro: {actorCreateErr}</div>}
        </div>
      )}

      {isCharactersPage && (
        <div className="app__toolbar">
          <button className="app__button" type="button" onClick={() => setIsCharacterModalOpen(true)}>
            Adicionar Personagem
          </button>
          {characterCreateErr && <div className="app__error">Erro: {characterCreateErr}</div>}
        </div>
      )}

      {isShowsPage && (
        <div className="app__toolbar">
          <button className="app__button" type="button" onClick={() => setIsShowModalOpen(true)}>
            Adicionar Show
          </button>
          {showCreateErr && <div className="app__error">Erro: {showCreateErr}</div>}
        </div>
      )}

      {!isActorsPage && !isCharactersPage && !isShowsPage && (
        <div className="app__toolbar">
          <button className="app__button" type="button" onClick={() => setIsEpisodeModalOpen(true)}>
            Adicionar Episódio
          </button>
          {episodeCreateErr && <div className="app__error">Erro: {episodeCreateErr}</div>}
        </div>
      )}

      {(isActorsPage ? actorsErr : isCharactersPage ? charactersErr : isShowsPage ? showsErr : episodesErr) && (
        <div className="app__error">
          Erro: {isActorsPage ? actorsErr : isCharactersPage ? charactersErr : isShowsPage ? showsErr : episodesErr}
        </div>
      )}

      {isActorsPage ? (
        <main className="app__results">
          {!actorsLoading && !actorsErr && actorsItems.length === 0 && (
            <div className="app__empty">Nenhum ator encontrado.</div>
          )}

          {actorsItems.map((actor, index) => (
            <ActorCard
              key={actor.id ?? actor.name ?? index}
              actor={actor}
              onSelect={handleCharacterSelect}
              onOpen={() => setSelectedActor(actor)}
            />
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
              onSelect={handleCharacterSelect}
            />
          ))}
        </main>
      ) : isShowsPage ? (
        <main className="app__results">
          {!showsLoading && !showsErr && showsItems.length === 0 && (
            <div className="app__empty">Nenhum show encontrado.</div>
          )}

          {showsItems.map((show, index) => (
            <ShowCard key={show.id ?? show.name ?? index} show={show} onSelect={setSelectedShow} />
          ))}
        </main>
      ) : (
        <main className="app__results">
          {!episodesLoading && !episodesErr && episodesItems.length === 0 && (
            <div className="app__empty">Nenhum resultado.</div>
          )}

          {filteredEpisodes.map((ep) => (
            <EpisodeCard
              key={ep.id}
              episode={ep}
              onSelect={handleCharacterSelect}
              onEpisodeSelect={(value) => setSelectedEpisode(value)}
              onShowSelect={(value) => setSelectedShow(value)}
            />
          ))}

          {episodesPaginationActive && episodesItems.length > 0 && (
            <div className="app__pagination">
              {episodesPagingLoading && <div className="app__pagination-status">Carregando mais…</div>}
              {!episodesPagingLoading && !episodesHasMore && (
                <div className="app__pagination-status">Fim dos resultados.</div>
              )}
              <div ref={episodesLoadMoreRef} className="app__pagination-sentinel" aria-hidden="true" />
            </div>
          )}
        </main>
      )}

      <CharacterModal
        character={selectedCharacter}
        episodes={characterEpisodes}
        loading={characterEpisodesLoading}
        error={characterDetailsErr || characterEpisodesErr}
        onClose={handleCloseCharacterModal}
        onBack={characterModalBackHandler}
        onShowSelect={(value) => setSelectedShow(value)}
        onEdit={() => setIsEditCharacterModalOpen(true)}
      />

      <ActorDetailsModal
        actor={selectedActor}
        onClose={() => setSelectedActor(null)}
        onCharacterSelect={handleCharacterSelectFromActor}
        onActorUpdated={handleActorUpdated}
      />

      <ShowModal
        show={selectedShow}
        episodes={showEpisodes}
        loading={showEpisodesLoading}
        error={showEpisodesErr}
        onClose={() => setSelectedShow(null)}
      />

      <EpisodeModal
        episode={selectedEpisode}
        onClose={() => setSelectedEpisode(null)}
        onCharacterSelect={handleCharacterSelectFromEpisode}
      />

      <ActorModal
        isOpen={isActorModalOpen}
        onClose={() => setIsActorModalOpen(false)}
        onSubmit={handleCreateActor}
      />

      <AddCharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        onSubmit={handleCreateCharacter}
        actors={characterActors}
        actorsLoading={characterActorsLoading}
        actorsError={characterActorsErr}
      />

      <EditCharacterModal
        isOpen={isEditCharacterModalOpen}
        character={selectedCharacter}
        onClose={() => setIsEditCharacterModalOpen(false)}
        onSubmit={handleUpdateCharacter}
        actors={characterActors}
        actorsLoading={characterActorsLoading}
        actorsError={characterActorsErr}
      />

      <AddShowModal
        isOpen={isShowModalOpen}
        onClose={() => setIsShowModalOpen(false)}
        onSubmit={handleCreateShow}
      />

      <AddEpisodeModal
        isOpen={isEpisodeModalOpen}
        onClose={() => setIsEpisodeModalOpen(false)}
        onSubmit={handleCreateEpisode}
        shows={episodeShows}
        showsLoading={episodeShowsLoading}
        showsError={episodeShowsErr}
        characters={episodeCharacters}
        charactersLoading={episodeCharactersLoading}
        charactersError={episodeCharactersErr}
      />
    </div>
  );
}
