import "./ShowLabel.scss";

export default function ShowLabel({ show, onSelect }) {
  if (!show) return null;

  const label = typeof show === "string" ? show : show.name;
  const title = typeof show === "string" ? show : show.nameEs;
  const isButton = typeof onSelect === "function";

  if (!isButton) {
    return (
      <span className="show-label" title={title}>
        {label}
      </span>
    );
  }

  return (
    <button
      className="show-label show-label--button"
      type="button"
      title={title}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(show);
      }}
    >
      {label}
    </button>
  );
}
