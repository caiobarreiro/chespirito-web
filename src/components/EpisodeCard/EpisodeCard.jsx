import Badge from "../Badge/Badge.jsx";
import ShowLabel from "../ShowLabel/ShowLabel.jsx";
import "./EpisodeCard.scss";

export default function EpisodeCard({ episode, onSelect, onShowSelect, onEpisodeSelect }) {
  const chars = Array.isArray(episode.characters) ? episode.characters : [];
  const parsedAirDate = episode.airDate ? new Date(episode.airDate) : null;
  const formattedAirDate =
    parsedAirDate && !Number.isNaN(parsedAirDate.getTime())
      ? new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(parsedAirDate)
      : "—";

  const handleCharacterSelect = (event, character) => {
    event.stopPropagation();
    if (onSelect) {
      onSelect(character);
    }
  };

  const cardClassName = onEpisodeSelect ? "episode-card episode-card--clickable" : "episode-card";

  return (
    <div
      className={cardClassName}
      onClick={onEpisodeSelect ? () => onEpisodeSelect(episode) : undefined}
      role={onEpisodeSelect ? "button" : undefined}
      tabIndex={onEpisodeSelect ? 0 : undefined}
      onKeyDown={
        onEpisodeSelect
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onEpisodeSelect(episode);
              }
            }
          : undefined
      }
    >
      <div className="episode-card__header">
        <ShowLabel show={episode.show} onSelect={onShowSelect} />
        <div className="episode-card__titles">
          <div className="episode-card__title">{episode.title}</div>
          <div className="episode-card__subtitle">({episode.titleEs})</div>
        </div>
      </div>

      {chars.length > 0 && (
        <div className="episode-card__badges">
          {chars.map((c) => (
            <Badge
              key={c.id ?? c.name}
              title={c.name}
              onClick={onSelect ? (event) => handleCharacterSelect(event, c) : undefined}
            >
              {c.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="episode-card__meta">
        Temporada {episode.season} • Ep {episode.episodeNumber} • {formattedAirDate}
      </div>

      <div className="episode-card__synopsis">{episode.synopsisPt}</div>
    </div>
  );
}
