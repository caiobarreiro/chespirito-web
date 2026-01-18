import Badge from "../Badge/Badge.jsx";
import ShowLabel from "../ShowLabel/ShowLabel.jsx";
import "./EpisodeCard.scss";

export default function EpisodeCard({ episode, onSelect }) {
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

  return (
    <div className="episode-card">
      <div className="episode-card__header">
        <ShowLabel show={episode.show} />
        <div className="episode-card__titles">
          <div className="episode-card__title">{episode.title}</div>
          <div className="episode-card__subtitle">({episode.titleEs})</div>
        </div>
      </div>

      {chars.length > 0 && (
        <div className="episode-card__badges">
          {chars.map((c) => (
            <Badge key={c.id ?? c.name} title={c.name} onClick={onSelect ? () => onSelect(c) : undefined}>
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
