import Badge from "../Badge/Badge.jsx";
import "./ActorCard.scss";

function getActorName(actor) {
  return actor?.name ?? actor?.actor ?? actor?.fullName ?? "Nome não informado";
}

export default function ActorCard({ actor, onSelect }) {
  const roles = Array.isArray(actor?.characters)
    ? actor.characters
    : Array.isArray(actor?.roles)
    ? actor.roles
    : [];

  const shows = Array.isArray(actor?.shows) ? actor.shows : [];

  return (
    <div className="actor-card">
      <div className="actor-card__title">{getActorName(actor)}</div>

      {roles.length > 0 && (
        <div className="actor-card__section">
          <div className="actor-card__label">Personagens</div>
          <div className="actor-card__badges">
            {roles.map((role) => {
              const name = typeof role === "string" ? role : role?.name;
              if (!name) return null;
              return (
                <Badge
                  key={name}
                  title={name}
                  onClick={onSelect ? () => onSelect(typeof role === "string" ? { name } : role) : undefined}
                >
                  {name}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {shows.length > 0 && (
        <div className="actor-card__meta">
          {shows.map((show) => (typeof show === "string" ? show : show?.name)).filter(Boolean).join(" • ")}
        </div>
      )}
    </div>
  );
}
