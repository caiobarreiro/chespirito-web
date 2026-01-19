import "./ShowCard.scss";

function getShowField(show, key, fallbackKey) {
  return show?.[key] ?? (fallbackKey ? show?.[fallbackKey] : undefined);
}

function formatShowDate(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

export default function ShowCard({ show, onSelect }) {
  if (!show) return null;

  const name = getShowField(show, "name", "namePt") ?? "Show sem nome";
  const nameEs = getShowField(show, "nameEs");
  const startDate = formatShowDate(getShowField(show, "startDate"));
  const endDate = formatShowDate(getShowField(show, "endData", "endDate"));
  const isClickable = typeof onSelect === "function";

  function handleKeyDown(event) {
    if (!isClickable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(show);
    }
  }

  return (
    <div
      className={isClickable ? "show-card show-card--clickable" : "show-card"}
      onClick={isClickable ? () => onSelect(show) : undefined}
      onKeyDown={handleKeyDown}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="show-card__title">{name}</div>
      {nameEs && <div className="show-card__subtitle">{nameEs}</div>}
      <div className="show-card__dates">
        <div className="show-card__date">
          <span className="show-card__label">Início de Exibição</span>
          <span className="show-card__value">{startDate}</span>
        </div>
        <div className="show-card__date">
          <span className="show-card__label">Fim de Exibição</span>
          <span className="show-card__value">{endDate}</span>
        </div>
      </div>
    </div>
  );
}
