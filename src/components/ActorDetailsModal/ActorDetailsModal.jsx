import { useEffect } from "react";
import Badge from "../Badge/Badge.jsx";
import "./ActorDetailsModal.scss";

function getActorName(actor) {
  return actor?.name ?? actor?.fullName ?? "Ator";
}

function getActorFullName(actor) {
  return actor?.fullName ?? actor?.name ?? "Não informado";
}

function formatDate(value) {
  if (!value) return "Não informado";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("pt-BR");
}

export default function ActorDetailsModal({ actor, onClose, onCharacterSelect }) {
  if (!actor) return null;

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const roles = Array.isArray(actor?.characters)
    ? actor.characters
    : Array.isArray(actor?.roles)
    ? actor.roles
    : [];

  return (
    <div className="actor-details-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="actor-details-modal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="actor-details-modal__header">
          <h2 className="actor-details-modal__title">{getActorName(actor)}</h2>
          <button className="actor-details-modal__close" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="actor-details-modal__details">
          <div className="actor-details-modal__detail">
            <span className="actor-details-modal__label">Nome completo</span>
            <span className="actor-details-modal__value">{getActorFullName(actor)}</span>
          </div>
          <div className="actor-details-modal__detail">
            <span className="actor-details-modal__label">Data de nascimento</span>
            <span className="actor-details-modal__value">{formatDate(actor?.dob)}</span>
          </div>
          <div className="actor-details-modal__detail">
            <span className="actor-details-modal__label">Data de falecimento</span>
            <span className="actor-details-modal__value">{formatDate(actor?.dod)}</span>
          </div>
        </div>

        <div className="actor-details-modal__section">
          <div className="actor-details-modal__section-title">Personagens</div>
          {roles.length === 0 ? (
            <div className="actor-details-modal__empty">Nenhum personagem cadastrado.</div>
          ) : (
            <div className="actor-details-modal__badges">
              {roles.map((role) => {
                const name = typeof role === "string" ? role : role?.name ?? role?.character;
                if (!name) return null;
                return (
                  <Badge
                    key={name}
                    title={name}
                    onClick={
                      onCharacterSelect
                        ? () => onCharacterSelect(typeof role === "string" ? { name } : role)
                        : undefined
                    }
                  >
                    {name}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
