import { useEffect } from "react";
import "./ShowModal.scss";

function getShowName(show) {
  return typeof show === "string" ? show : show?.name ?? show?.namePt ?? "Show";
}

export default function ShowModal({ show, episodes, loading, error, onClose }) {
  if (!show) return null;

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="show-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="show-modal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="show-modal__header">
          <h2 className="show-modal__title">Episódios de {getShowName(show)}</h2>
          <button className="show-modal__close" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        {loading && <div className="show-modal__status">Carregando episódios…</div>}
        {error && !loading && <div className="show-modal__error">Erro: {error}</div>}
        {!loading && !error && episodes.length === 0 && (
          <div className="show-modal__status">Nenhum episódio encontrado para este show.</div>
        )}

        {!loading && !error && episodes.length > 0 && (
          <ul className="show-modal__list">
            {episodes.map((episode) => (
              <li key={episode.id ?? episode.title} className="show-modal__item">
                <div>
                  <div className="show-modal__item-title">{episode.title}</div>
                  {episode.titleEs && (
                    <div className="show-modal__item-subtitle">({episode.titleEs})</div>
                  )}
                </div>
                {episode.synopsisPt && (
                  <div className="show-modal__item-synopsis">{episode.synopsisPt}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
