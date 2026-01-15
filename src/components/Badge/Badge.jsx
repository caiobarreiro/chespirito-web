import "./Badge.scss";

export default function Badge({ children, title }) {
  return (
    <span className="badge" title={title}>
      {children}
    </span>
  );
}
