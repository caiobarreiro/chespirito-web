import { useEffect, useMemo, useState } from "react";
import Badge from "../Badge/Badge.jsx";
import { updateActor } from "../../services/api.js";
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

export default function ActorDetailsModal({ actor, onClose, onCharacterSelect, onActorUpdated }) {
  if (!actor) return null;

  const [currentActor, setCurrentActor] = useState(actor);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    dob: "",
    dod: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!actor) return;
    setCurrentActor(actor);
    setFormData({
      name: actor?.name ?? "",
      fullName: actor?.fullName ?? "",
      dob: actor?.dob ?? "",
      dod: actor?.dod ?? "",
    });
    setIsEditing(false);
    setError("");
  }, [actor]);

  const roles = Array.isArray(currentActor?.characters)
    ? currentActor.characters
    : Array.isArray(currentActor?.roles)
    ? currentActor.roles
    : [];

  const actorId = currentActor?.id ?? currentActor?.uuid;
  const canEdit = Boolean(actorId);

  const formattedValues = useMemo(
    () => ({
      fullName: getActorFullName(currentActor),
      dob: formatDate(currentActor?.dob),
      dod: formatDate(currentActor?.dod),
    }),
    [currentActor]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData({
      name: currentActor?.name ?? "",
      fullName: currentActor?.fullName ?? "",
      dob: currentActor?.dob ?? "",
      dod: currentActor?.dod ?? "",
    });
    setIsEditing(false);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!actorId) return;
    try {
      setSaving(true);
      setError("");
      const updated = await updateActor({
        id: actorId,
        name: formData.name,
        fullName: formData.fullName,
        dob: formData.dob,
        dod: formData.dod,
      });
      const updatedActor = updated?.actor ?? updated;
      setCurrentActor(updatedActor);
      if (onActorUpdated) {
        onActorUpdated(updatedActor);
      }
      setFormData({
        name: updatedActor?.name ?? formData.name,
        fullName: updatedActor?.fullName ?? formData.fullName,
        dob: updatedActor?.dob ?? formData.dob,
        dod: updatedActor?.dod ?? formData.dod,
      });
      setIsEditing(false);
    } catch (err) {
      setError(err?.message ?? "Erro ao atualizar ator");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="actor-details-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="actor-details-modal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="actor-details-modal__header">
          <h2 className="actor-details-modal__title">{getActorName(currentActor)}</h2>
          <div className="actor-details-modal__actions">
            {canEdit && (
              <button
                className="actor-details-modal__icon-button"
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                aria-label={isEditing ? "Cancelar edição" : "Editar ator"}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M16.862 3.487a2.25 2.25 0 013.182 3.182l-9.72 9.72a2.25 2.25 0 01-1.06.58l-4.11.995a.75.75 0 01-.905-.905l.995-4.11a2.25 2.25 0 01.58-1.06l9.72-9.72z"
                    fill="currentColor"
                  />
                  <path d="M6 20.25h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <button className="actor-details-modal__close" type="button" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>

        <form className="actor-details-modal__details" onSubmit={handleSubmit}>
          <div className="actor-details-modal__detail">
            <span className="actor-details-modal__label">Nome</span>
            {isEditing ? (
              <input
                className="actor-details-modal__input"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            ) : (
              <span className="actor-details-modal__value">{currentActor?.name ?? "Não informado"}</span>
            )}
          </div>
          <div className="actor-details-modal__detail">
            <span className="actor-details-modal__label">Nome completo</span>
            {isEditing ? (
              <input
                className="actor-details-modal__input"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            ) : (
              <span className="actor-details-modal__value">{formattedValues.fullName}</span>
            )}
          </div>
          <div className="actor-details-modal__detail">
            <span className="actor-details-modal__label">Data de nascimento</span>
            {isEditing ? (
              <input
                className="actor-details-modal__input"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
              />
            ) : (
              <span className="actor-details-modal__value">{formattedValues.dob}</span>
            )}
          </div>
          <div className="actor-details-modal__detail">
            <span className="actor-details-modal__label">Data de falecimento</span>
            {isEditing ? (
              <input
                className="actor-details-modal__input"
                name="dod"
                type="date"
                value={formData.dod}
                onChange={handleChange}
              />
            ) : (
              <span className="actor-details-modal__value">{formattedValues.dod}</span>
            )}
          </div>
          {error && <div className="actor-details-modal__error">Erro: {error}</div>}
          {isEditing && (
            <div className="actor-details-modal__edit-actions">
              <button
                className="actor-details-modal__button"
                type="button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </button>
              <button className="actor-details-modal__button actor-details-modal__button--primary" type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          )}
        </form>

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
