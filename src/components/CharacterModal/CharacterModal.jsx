import ShowLabel from "../ShowLabel/ShowLabel.jsx";
import "./CharacterModal.scss";

function getCharacterName(character) {
  return character?.name ?? character?.character ?? character?.nickname ?? "Personagem";
}

export default function CharacterModal({ character, episodes, loading, error, onClose }) {
  if (!character) return null;

  return (
    <div className="character-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="character-modal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="character-modal__header">
          <h2 className="character-modal__title">Episódios de {getCharacterName(character)}</h2>
          <button className="character-modal__close" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        {loading && <div className="character-modal__status">Carregando episódios…</div>}
        {error && !loading && <div className="character-modal__error">Erro: {error}</div>}
        {!loading && !error && episodes.length === 0 && (
          <div className="character-modal__status">Nenhum episódio encontrado para este personagem.</div>
        )}

        {!loading && !error && episodes.length > 0 && (
          <ul className="character-modal__list">
            {episodes.map((episode) => (
              <li key={episode.id ?? episode.title} className="character-modal__item">
                <div className="character-modal__item-header">
                  <ShowLabel show={episode.show} />
                  <div>
                    <div className="character-modal__item-title">{episode.title}</div>
                    {episode.titleEs && (
                      <div className="character-modal__item-subtitle">({episode.titleEs})</div>
                    )}
                  </div>
                </div>
                {episode.synopsisPt && (
                  <div className="character-modal__item-synopsis">{episode.synopsisPt}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
