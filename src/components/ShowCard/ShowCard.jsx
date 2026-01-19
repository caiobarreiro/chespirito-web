import "./ShowCard.scss";

function getShowField(show, key, fallbackKey) {
  return show?.[key] ?? (fallbackKey ? show?.[fallbackKey] : undefined);
}

export default function ShowCard({ show }) {
  if (!show) return null;

  const name = getShowField(show, "name", "namePt") ?? "Show sem nome";
  const nameEs = getShowField(show, "nameEs");
  const startDate = getShowField(show, "startDate");
  const endDate = getShowField(show, "endData", "endDate");

  return (
    <div className="show-card">
      <div className="show-card__title">{name}</div>
      {nameEs && <div className="show-card__subtitle">{nameEs}</div>}
      <div className="show-card__dates">
        <div className="show-card__date">
          <span className="show-card__label">Início de Exibição</span>
          <span className="show-card__value">{startDate || "—"}</span>
        </div>
        <div className="show-card__date">
          <span className="show-card__label">Fim de Exibição</span>
          <span className="show-card__value">{endDate || "—"}</span>
        </div>
      </div>
    </div>
  );
}
