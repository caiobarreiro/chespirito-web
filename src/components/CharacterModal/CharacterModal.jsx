import { useEffect, useMemo, useState } from "react";
import ShowLabel from "../ShowLabel/ShowLabel.jsx";
import "./CharacterModal.scss";

function getCharacterName(character) {
  return character?.name ?? character?.character ?? character?.nickname ?? "Personagem";
}

function getActorName(actor) {
  if (!actor) return "";
  if (typeof actor === "string") return actor;
  return actor?.name ?? actor?.actor ?? actor?.fullName ?? "";
}

function getShowName(show) {
  return typeof show === "string" ? show : show?.name ?? show?.namePt ?? "";
}

function getNormalizedShowKey(show) {
  return getShowName(show).trim().toLowerCase();
}

export default function CharacterModal({
  character,
  episodes,
  loading,
  error,
  onClose,
  onBack,
  onShowSelect,
  onEdit,
}) {
  if (!character) return null;

  const showOptions = useMemo(() => {
    const fromCharacter = Array.isArray(character?.shows) ? character.shows : [];
    const fallbackShows = episodes.map((episode) => episode.show).filter(Boolean);
    const source = fromCharacter.length > 0 ? fromCharacter : fallbackShows;
    const options = new Map();

    source.forEach((show) => {
      const name = getShowName(show);
      const key = getNormalizedShowKey(show);
      if (!name || !key) return;
      if (!options.has(key)) {
        options.set(key, { key, label: name });
      }
    });

    return Array.from(options.values());
  }, [character?.shows, episodes]);

  const hasMultipleShows = showOptions.length > 1;
  const [selectedShowKey, setSelectedShowKey] = useState("");

  useEffect(() => {
    if (showOptions.length === 0) {
      setSelectedShowKey("");
      return;
    }

    const defaultShow =
      showOptions.find((option) => option.key === "chaves") ?? showOptions[0];
    setSelectedShowKey(defaultShow?.key ?? "");
  }, [showOptions, character?.id]);

  const filteredEpisodes =
    hasMultipleShows && selectedShowKey
      ? episodes.filter(
          (episode) => getNormalizedShowKey(episode.show) === selectedShowKey,
        )
      : episodes;
  const actorName = getActorName(
    character?.actor ?? character?.actorName ?? character?.actorFullName,
  );

  return (
    <div className="character-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="character-modal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="character-modal__header">
          <div className="character-modal__header-main">
            {onBack && (
              <button className="character-modal__back" type="button" onClick={onBack}>
                ← Voltar
              </button>
            )}
            <div className="character-modal__title-block">
              <h2 className="character-modal__title">
                Episódios com {getCharacterName(character)}
              </h2>
              {actorName && (
                <div className="character-modal__actor-card">
                  <span className="character-modal__actor-label">Ator</span>
                  <span className="character-modal__actor-name">{actorName}</span>
                </div>
              )}
            </div>
          </div>
          <div className="character-modal__actions">
            {onEdit && (
              <button className="character-modal__edit" type="button" onClick={() => onEdit(character)}>
                Editar
              </button>
            )}
            <button className="character-modal__close" type="button" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>

        {loading && <div className="character-modal__status">Carregando episódios…</div>}
        {error && !loading && <div className="character-modal__error">Erro: {error}</div>}
        {!loading && !error && filteredEpisodes.length === 0 && (
          <div className="character-modal__status">Nenhum episódio encontrado para este personagem.</div>
        )}

        {!loading && !error && episodes.length > 0 && (
          <>
            {hasMultipleShows && (
              <div className="character-modal__shows" role="tablist" aria-label="Selecionar série">
                {showOptions.map((show) => (
                  <button
                    key={show.key}
                    className={
                      show.key === selectedShowKey
                        ? "character-modal__show-button character-modal__show-button--active"
                        : "character-modal__show-button"
                    }
                    type="button"
                    role="tab"
                    aria-selected={show.key === selectedShowKey}
                    onClick={() => setSelectedShowKey(show.key)}
                  >
                    {show.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && !error && filteredEpisodes.length > 0 && (
          <ul className="character-modal__list">
            {filteredEpisodes.map((episode) => (
              <li key={episode.id ?? episode.title} className="character-modal__item">
                <div className="character-modal__item-header">
                  <ShowLabel show={episode.show} onSelect={onShowSelect} />
                  <div>
                    <div className="character-modal__item-title">{episode.title}</div>
                    {episode.titleEs && (
                      <div className="character-modal__item-subtitle">({episode.titleEs})</div>
                    )}
                  </div>
                </div>
                {episode.synopsisPt && (
                  <div className="character-modal__item-synopsis">{episode.synopsisPt}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
