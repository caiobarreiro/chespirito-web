import { useEffect, useMemo, useState } from "react";
import Badge from "../Badge/Badge.jsx";
import "./AddEpisodeModal.scss";

const initialFormState = {
  showId: "",
  name: "",
  nameEs: "",
  airDate: "",
  season: "",
  episodeNumber: "",
  synopsis: "",
  synopsisEs: "",
  characterId: "",
};

function getShowLabel(show) {
  return show?.name ?? show?.namePt ?? show?.title ?? "Show sem nome";
}

function getCharacterLabel(character) {
  return character?.name ?? character?.namePt ?? character?.character ?? "Personagem sem nome";
}

function getOptionKey(item) {
  return String(item?.id ?? item?.name ?? "");
}

export default function AddEpisodeModal({
  isOpen,
  onClose,
  onSubmit,
  shows,
  showsLoading,
  showsError,
  characters,
  charactersLoading,
  charactersError,
}) {
  const [formData, setFormData] = useState(initialFormState);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setSelectedCharacters([]);
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

  const showOptions = Array.isArray(shows) ? shows : [];
  const characterOptions = Array.isArray(characters) ? characters : [];

  const selectedCharacterKeys = useMemo(
    () => new Set(selectedCharacters.map((character) => getOptionKey(character))),
    [selectedCharacters],
  );

  if (!isOpen) return null;

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleCharacterSelect(event) {
    const { value } = event.target;
    if (!value) return;
    const selected = characterOptions.find((character) => getOptionKey(character) === value);
    if (!selected) return;
    setSelectedCharacters((prev) => {
      if (prev.some((character) => getOptionKey(character) === value)) return prev;
      return [...prev, selected];
    });
    setFormData((prev) => ({ ...prev, characterId: "" }));
  }

  function handleRemoveCharacter(key) {
    setSelectedCharacters((prev) => prev.filter((character) => getOptionKey(character) !== key));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const selectedShow = showOptions.find((show) => getOptionKey(show) === formData.showId);
    if (!selectedShow) {
      setError("Selecione um show válido.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        show: {
          id: selectedShow.id,
          name: selectedShow.name ?? selectedShow.namePt ?? "",
          nameEs: selectedShow.nameEs ?? selectedShow.nameES ?? "",
          startDate: selectedShow.startDate ?? "",
          endDate: selectedShow.endDate ?? "",
        },
        episodeNumber: Number(formData.episodeNumber),
        season: Number(formData.season),
        airDate: formData.airDate,
        title: formData.name.trim(),
        titleES: formData.nameEs.trim(),
        synopsisPT: formData.synopsis.trim(),
        synopsisEs: formData.synopsisEs.trim(),
      });
      onClose();
    } catch (ex) {
      setError(ex.message || String(ex));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="add-episode-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="add-episode-modal__panel" onClick={(event) => event.stopPropagation()}>
        <div className="add-episode-modal__header">
          <h2 className="add-episode-modal__title">Adicionar Episódio</h2>
          <button className="add-episode-modal__close" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <form className="add-episode-modal__form" onSubmit={handleSubmit}>
          <label className="add-episode-modal__field">
            <span className="add-episode-modal__label">Show</span>
            <select
              className="add-episode-modal__input"
              name="showId"
              value={formData.showId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                {showsLoading ? "Carregando shows..." : "Selecione um show"}
              </option>
              {showOptions.map((show, index) => {
                const key = getOptionKey(show) || String(index);
                return (
                  <option key={key} value={key}>
                    {getShowLabel(show)}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="add-episode-modal__field">
            <span className="add-episode-modal__label">Nome do Episódio</span>
            <input
              className="add-episode-modal__input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome em português"
              required
            />
          </label>

          <label className="add-episode-modal__field">
            <span className="add-episode-modal__label">Nome do Episódio em Espanhol</span>
            <input
              className="add-episode-modal__input"
              name="nameEs"
              value={formData.nameEs}
              onChange={handleChange}
              placeholder="Nome em espanhol"
              required
            />
          </label>

          <label className="add-episode-modal__field">
            <span className="add-episode-modal__label">Data de estréia</span>
            <input
              className="add-episode-modal__input"
              type="date"
              name="airDate"
              value={formData.airDate}
              onChange={handleChange}
              required
            />
          </label>

          <div className="add-episode-modal__row">
            <label className="add-episode-modal__field">
              <span className="add-episode-modal__label">Temporada</span>
              <input
                className="add-episode-modal__input"
                type="number"
                name="season"
                value={formData.season}
                onChange={handleChange}
                min="1"
                placeholder="Número"
                required
              />
            </label>

            <label className="add-episode-modal__field">
              <span className="add-episode-modal__label">Episódio</span>
              <input
                className="add-episode-modal__input"
                type="number"
                name="episodeNumber"
                value={formData.episodeNumber}
                onChange={handleChange}
                min="1"
                placeholder="Número"
                required
              />
            </label>
          </div>

          <label className="add-episode-modal__field">
            <span className="add-episode-modal__label">Sinopse</span>
            <textarea
              className="add-episode-modal__input"
              name="synopsis"
              value={formData.synopsis}
              onChange={handleChange}
              placeholder="Resumo do episódio"
              rows={4}
              required
            />
          </label>

          <label className="add-episode-modal__field">
            <span className="add-episode-modal__label">Sinopse em Espanhol</span>
            <textarea
              className="add-episode-modal__input"
              name="synopsisEs"
              value={formData.synopsisEs}
              onChange={handleChange}
              placeholder="Resumen del episodio"
              rows={4}
              required
            />
          </label>

          <label className="add-episode-modal__field">
            <span className="add-episode-modal__label">Personagens</span>
            <select
              className="add-episode-modal__input"
              name="characterId"
              value={formData.characterId}
              onChange={handleCharacterSelect}
            >
              <option value="" disabled>
                {charactersLoading ? "Carregando personagens..." : "Selecione um personagem"}
              </option>
              {characterOptions.map((character, index) => {
                const key = getOptionKey(character) || String(index);
                return (
                  <option key={key} value={key} disabled={selectedCharacterKeys.has(key)}>
                    {getCharacterLabel(character)}
                  </option>
                );
              })}
            </select>
          </label>

          {(showsError || charactersError) && (
            <div className="add-episode-modal__error">
              {showsError && <div>Erro ao carregar shows: {showsError}</div>}
              {charactersError && <div>Erro ao carregar personagens: {charactersError}</div>}
            </div>
          )}

          {error && <div className="add-episode-modal__error">Erro: {error}</div>}

          {selectedCharacters.length > 0 && (
            <div className="add-episode-modal__badges" aria-label="Personagens selecionados">
              {selectedCharacters.map((character, index) => {
                const key = getOptionKey(character) || String(index);
                return (
                  <Badge key={key} onClick={() => handleRemoveCharacter(key)} title="Remover personagem">
                    {getCharacterLabel(character)} ×
                  </Badge>
                );
              })}
            </div>
          )}

          <div className="add-episode-modal__actions">
            <button className="add-episode-modal__button" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="add-episode-modal__button add-episode-modal__button--primary"
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
