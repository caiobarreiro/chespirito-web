import { useEffect, useState } from "react";
import "./ShowModal.scss";

function getShowName(show) {
  return typeof show === "string" ? show : show?.name ?? show?.namePt ?? "Show";
}

export default function ShowModal({ show, episodes, loading, error, onClose }) {
  if (!show) return null;

  const EPISODES_PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setCurrentPage(1);
  }, [show, episodes]);

  const totalPages = Math.max(1, Math.ceil(episodes.length / EPISODES_PAGE_SIZE));
  const clampedPage = Math.min(currentPage, totalPages);
  const pagedEpisodes = episodes.slice(
    (clampedPage - 1) * EPISODES_PAGE_SIZE,
    clampedPage * EPISODES_PAGE_SIZE,
  );

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
            {pagedEpisodes.map((episode) => (
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

        {!loading && !error && episodes.length > EPISODES_PAGE_SIZE && (
          <div className="show-modal__pagination" aria-label="Paginação de episódios">
            <button
              className="show-modal__pagination-button"
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={clampedPage === 1}
            >
              Anterior
            </button>
            <span className="show-modal__pagination-label">
              Página {clampedPage} de {totalPages}
            </span>
            <button
              className="show-modal__pagination-button"
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={clampedPage === totalPages}
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
