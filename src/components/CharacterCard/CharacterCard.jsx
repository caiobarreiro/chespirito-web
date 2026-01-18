import "./CharacterCard.scss";

function getCharacterName(character) {
  return character?.name ?? character?.character ?? character?.nickname ?? "Personagem sem nome";
}

export default function CharacterCard({ character, onSelect }) {
  const shows = Array.isArray(character?.shows) ? character.shows : [];

  return (
    <button className="character-card" type="button" onClick={() => onSelect(character)}>
      <div className="character-card__title">{getCharacterName(character)}</div>
      {shows.length > 0 && (
        <div className="character-card__meta">
          {shows.map((show) => (typeof show === "string" ? show : show?.name)).filter(Boolean).join(" • ")}
        </div>
      )}
    </button>
  );
}
