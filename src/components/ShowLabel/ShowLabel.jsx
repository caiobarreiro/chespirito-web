import "./ShowLabel.scss";

export default function ShowLabel({ show }) {
  if (!show) return null;

  return (
    <span className="show-label" title={show.nameEs}>
      {show.name}
    </span>
  );
}
