import { useEffect, useState } from "react";
import "./AddShowModal.scss";

const initialFormState = {
  name: "",
  nameEs: "",
  startDate: "",
  endData: "",
};

export default function AddShowModal({ isOpen, onClose, onSubmit }) {
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
        startDate: formData.startDate,
        endDate: formData.endDate || "",
      });
      onClose();
    } catch (ex) {
      setError(ex.message || String(ex));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="add-show-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="add-show-modal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="add-show-modal__header">
          <h2 className="add-show-modal__title">Adicionar Show</h2>
          <button className="add-show-modal__close" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <form className="add-show-modal__form" onSubmit={handleSubmit}>
          <label className="add-show-modal__field">
            <span className="add-show-modal__label">Nome</span>
            <input
              className="add-show-modal__input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome do show"
              required
            />
          </label>

          <label className="add-show-modal__field">
            <span className="add-show-modal__label">Nome em Espanhol</span>
            <input
              className="add-show-modal__input"
              name="nameEs"
              value={formData.nameEs}
              onChange={handleChange}
              placeholder="Nome em espanhol"
              required
            />
          </label>

          <label className="add-show-modal__field">
            <span className="add-show-modal__label">Início de Exibição</span>
            <input
              className="add-show-modal__input"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </label>

          <label className="add-show-modal__field">
            <span className="add-show-modal__label">Fim de Exibição</span>
            <input
              className="add-show-modal__input"
              type="date"
              name="endData"
              value={formData.endData}
              onChange={handleChange}
            />
          </label>

          {error && <div className="add-show-modal__error">Erro: {error}</div>}

          <div className="add-show-modal__actions">
            <button className="add-show-modal__button" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="add-show-modal__button add-show-modal__button--primary"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Salvando..." : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
