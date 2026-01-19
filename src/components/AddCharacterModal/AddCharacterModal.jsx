import { useEffect, useState } from "react";
import "./AddCharacterModal.scss";

const initialFormState = {
  name: "",
  nameEs: "",
  actorId: "",
};

function getActorName(actor) {
  return actor?.name ?? actor?.actor ?? actor?.fullName ?? "Ator sem nome";
}

export default function AddCharacterModal({
  isOpen,
  onClose,
  onSubmit,
  actors,
  actorsLoading,
  actorsError,
}) {
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setError("");
      setSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        nameEs: formData.nameEs.trim(),
        actorId: formData.actorId,
      });
      onClose();
    } catch (ex) {
      setError(ex.message || String(ex));
    } finally {
      setSubmitting(false);
    }
  }

  const actorOptions = Array.isArray(actors) ? actors : [];

  return (
    <div className="add-character-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="add-character-modal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="add-character-modal__header">
          <h2 className="add-character-modal__title">Adicionar Personagem</h2>
          <button className="add-character-modal__close" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <form className="add-character-modal__form" onSubmit={handleSubmit}>
          <label className="add-character-modal__field">
            <span className="add-character-modal__label">Nome</span>
            <input
              className="add-character-modal__input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome em português"
              required
            />
          </label>

          <label className="add-character-modal__field">
            <span className="add-character-modal__label">Nome em Espanhol</span>
            <input
              className="add-character-modal__input"
              name="nameEs"
              value={formData.nameEs}
              onChange={handleChange}
              placeholder="Nome em espanhol"
              required
            />
          </label>

          <label className="add-character-modal__field">
            <span className="add-character-modal__label">Ator</span>
            <select
              className="add-character-modal__input"
              name="actorId"
              value={formData.actorId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                {actorsLoading ? "Carregando atores..." : "Selecione um ator"}
              </option>
              {actorOptions.map((actor, index) => (
                <option key={actor.id ?? actor.name ?? index} value={actor.id ?? actor.name ?? ""}>
                  {getActorName(actor)}
                </option>
              ))}
            </select>
          </label>

          {actorsError && <div className="add-character-modal__error">Erro ao carregar atores: {actorsError}</div>}
          {error && <div className="add-character-modal__error">Erro: {error}</div>}

          <div className="add-character-modal__actions">
            <button className="add-character-modal__button" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="add-character-modal__button add-character-modal__button--primary"
              type="submit"
              disabled={submitting || actorsLoading}
            >
              {submitting ? "Salvando..." : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
