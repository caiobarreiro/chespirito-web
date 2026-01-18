import "./Badge.scss";

export default function Badge({ children, title, onClick }) {
  const className = onClick ? "badge badge--button" : "badge";

  if (onClick) {
    return (
      <button className={className} type="button" title={title} onClick={onClick}>
        {children}
      </button>
    );
  }

  return (
    <span className={className} title={title}>
      {children}
    </span>
  );
}
