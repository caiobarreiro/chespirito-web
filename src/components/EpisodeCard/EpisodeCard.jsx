import Badge from "../Badge/Badge.jsx";
import ShowLabel from "../ShowLabel/ShowLabel.jsx";
import "./EpisodeCard.scss";

export default function EpisodeCard({ episode }) {
  const chars = Array.isArray(episode.characters) ? episode.characters : [];

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
            <Badge key={c.id ?? c.name} title={c.name}>
              {c.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="episode-card__meta">
        Temporada {episode.season} • Ep {episode.episodeNumber} • {episode.airDate ?? "—"}
      </div>

      <div className="episode-card__synopsis">{episode.synopsisPt}</div>
    </div>
  );
}
