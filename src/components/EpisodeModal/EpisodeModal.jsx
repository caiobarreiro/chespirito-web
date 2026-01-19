import { useEffect, useMemo, useState } from "react";
import Badge from "../Badge/Badge.jsx";
import "./EpisodeModal.scss";

export default function EpisodeModal({ episode, onClose, onCharacterSelect }) {
  const [language, setLanguage] = useState("pt");

  useEffect(() => {
    if (episode) {
      setLanguage("pt");
    }
  }, [episode]);

  const airDate = useMemo(() => {
    if (!episode?.airDate) return "—";
    const parsed = new Date(episode.airDate);
    if (Number.isNaN(parsed.getTime())) return "—";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(parsed);
  }, [episode?.airDate]);

  const characters = Array.isArray(episode?.characters) ? episode.characters : [];
  const synopsis = language === "es" ? episode?.synopsisEs : episode?.synopsisPt;

  const handleCharacterSelect = (character) => {
    if (onCharacterSelect) {
      onCharacterSelect(character);
    }
  };

  if (!episode) return null;

  return (
    <div className="episode-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="episode-modal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="episode-modal__header">
          <div>
            <h2 className="episode-modal__title">{episode.title}</h2>
            {episode.titleEs && <div className="episode-modal__subtitle">{episode.titleEs}</div>}
          </div>
          <button className="episode-modal__close" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="episode-modal__meta">
          <span>
            Temporada {episode.season} • Ep {episode.episodeNumber}
          </span>
          <span>• {airDate}</span>
        </div>

        {characters.length > 0 && (
          <div className="episode-modal__characters">
            <div className="episode-modal__label">Personagens</div>
            <div className="episode-modal__badges">
              {characters.map((character) => (
                <Badge
                  key={character.id ?? character.name}
                  title={character.name}
                  onClick={
                    onCharacterSelect ? () => handleCharacterSelect(character) : undefined
                  }
                >
                  {character.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="episode-modal__synopsis">
          <div className="episode-modal__synopsis-header">
            <div className="episode-modal__label">Sinopse</div>
            <div className="episode-modal__toggle" role="tablist" aria-label="Selecionar idioma">
              <button
                className={
                  language === "pt"
                    ? "episode-modal__toggle-button episode-modal__toggle-button--active"
                    : "episode-modal__toggle-button"
                }
                type="button"
                onClick={() => setLanguage("pt")}
                role="tab"
                aria-selected={language === "pt"}
              >
                PT
              </button>
              <button
                className={
                  language === "es"
                    ? "episode-modal__toggle-button episode-modal__toggle-button--active"
                    : "episode-modal__toggle-button"
                }
                type="button"
                onClick={() => setLanguage("es")}
                role="tab"
                aria-selected={language === "es"}
              >
                ES
              </button>
            </div>
          </div>
          <div className="episode-modal__synopsis-text">
            {synopsis || "Sinopse indisponível."}
          </div>
        </div>
      </div>
    </div>
  );
}
