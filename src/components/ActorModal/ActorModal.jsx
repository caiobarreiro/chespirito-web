import { useEffect, useState } from "react";
import "./ActorModal.scss";

const initialFormState = {
  name: "",
  fullName: "",
  dob: "",
  dod: "",
};

export default function ActorModal({ isOpen, onClose, onSubmit }) {
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
        fullName: formData.fullName.trim(),
        dob: formData.dob,
        dod: formData.dod || "",
      });
      onClose();
    } catch (ex) {
      setError(ex.message || String(ex));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="actor-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="actor-modal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="actor-modal__header">
          <h2 className="actor-modal__title">Adicionar Ator</h2>
          <button className="actor-modal__close" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <form className="actor-modal__form" onSubmit={handleSubmit}>
          <label className="actor-modal__field">
            <span className="actor-modal__label">Nome</span>
            <input
              className="actor-modal__input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome artístico"
              required
            />
          </label>

          <label className="actor-modal__field">
            <span className="actor-modal__label">Nome Completo</span>
            <input
              className="actor-modal__input"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nome completo"
              required
            />
          </label>

          <label className="actor-modal__field">
            <span className="actor-modal__label">Data de Nascimento</span>
            <input
              className="actor-modal__input"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </label>

          <label className="actor-modal__field">
            <span className="actor-modal__label">Data de Falecimento</span>
            <input
              className="actor-modal__input"
              type="date"
              name="dod"
              value={formData.dod}
              onChange={handleChange}
            />
          </label>

          {error && <div className="actor-modal__error">Erro: {error}</div>}

          <div className="actor-modal__actions">
            <button className="actor-modal__button" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="actor-modal__button actor-modal__button--primary" type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
