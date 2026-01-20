import { useEffect, useMemo, useState } from "react";
import "./EditCharacterModal.scss";

const initialFormState = {
  name: "",
  nameEs: "",
  actorId: "",
};

function getActorName(actor) {
  return actor?.name ?? actor?.actor ?? actor?.fullName ?? "Ator sem nome";
}

function getActorId(actor) {
  return actor?.id ?? actor?.uuid ?? "";
}

export default function EditCharacterModal({
  isOpen,
  character,
  onClose,
  onSubmit,
  actors,
  actorsLoading,
  actorsError,
}) {
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const actorOptions = useMemo(() => (Array.isArray(actors) ? actors : []), [actors]);
  const characterId = character?.id ?? character?.uuid;

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setSubmitting(false);
    setFormData({
      name: character?.name ?? "",
      nameEs: character?.nameEs ?? character?.nameES ?? character?.originalName ?? "",
      actorId: getActorId(character?.actor) || "",
    });
  }, [isOpen, character]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !character) return null;

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!characterId) return;
    setError("");
    setSubmitting(true);
    try {
      const selectedActor = actorOptions.find(
        (actor) => String(getActorId(actor)) === String(formData.actorId),
      );
      await onSubmit({
        id: characterId,
        name: formData.name.trim(),
        originalName: formData.nameEs.trim(),
        actor: formData.actorId ? selectedActor ?? null : null,
      });
      onClose();
    } catch (ex) {
      setError(ex.message || String(ex));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="edit-character-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="edit-character-modal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="edit-character-modal__header">
          <h2 className="edit-character-modal__title">Editar Personagem</h2>
          <button className="edit-character-modal__close" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <form className="edit-character-modal__form" onSubmit={handleSubmit}>
          <label className="edit-character-modal__field">
            <span className="edit-character-modal__label">Nome</span>
            <input
              className="edit-character-modal__input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome em português"
              required
            />
          </label>

          <label className="edit-character-modal__field">
            <span className="edit-character-modal__label">Nome em Espanhol</span>
            <input
              className="edit-character-modal__input"
              name="nameEs"
              value={formData.nameEs}
              onChange={handleChange}
              placeholder="Nome em espanhol"
              required
            />
          </label>

          <label className="edit-character-modal__field">
            <span className="edit-character-modal__label">Ator</span>
            <select
              className="edit-character-modal__input"
              name="actorId"
              value={formData.actorId}
              onChange={handleChange}
            >
              <option value="">
                {actorsLoading ? "Carregando atores..." : "Sem ator"}
              </option>
              {actorOptions.map((actor, index) => {
                const actorId = getActorId(actor) || actor?.name || index;
                return (
                  <option key={actorId} value={getActorId(actor) || ""}>
                    {getActorName(actor)}
                  </option>
                );
              })}
            </select>
          </label>

          {actorsError && <div className="edit-character-modal__error">Erro ao carregar atores: {actorsError}</div>}
          {error && <div className="edit-character-modal__error">Erro: {error}</div>}

          <div className="edit-character-modal__actions">
            <button className="edit-character-modal__button" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="edit-character-modal__button edit-character-modal__button--primary"
              type="submit"
              disabled={submitting || actorsLoading}
            >
              {submitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
