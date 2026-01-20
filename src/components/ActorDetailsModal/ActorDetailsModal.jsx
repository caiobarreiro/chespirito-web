import { useEffect, useMemo, useRef, useState } from "react";
import Badge from "../Badge/Badge.jsx";
import { fetchCharacters, updateActor, updateActorCharacters } from "../../services/api.js";
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

function getCharacterLabel(character) {
  if (typeof character === "string") return character;
  return character?.name ?? character?.namePt ?? character?.character ?? "Personagem";
}

function getCharacterKey(character) {
  return String(
    character?.id ?? character?.uuid ?? character?.name ?? character?.character ?? (typeof character === "string" ? character : ""),
  );
}

function getCharacterKeys(characters) {
  return (Array.isArray(characters) ? characters : [])
    .map((character) => getCharacterKey(character))
    .filter(Boolean)
    .sort();
}

function areCharactersEqual(current, initial) {
  const currentKeys = getCharacterKeys(current);
  const initialKeys = getCharacterKeys(initial);
  if (currentKeys.length !== initialKeys.length) return false;
  return currentKeys.every((key, index) => key === initialKeys[index]);
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
    characterId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [characterOptions, setCharacterOptions] = useState([]);
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [charactersError, setCharactersError] = useState("");
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const initialCharactersRef = useRef([]);

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
    const nextRoles = Array.isArray(actor?.characters)
      ? actor.characters
      : Array.isArray(actor?.roles)
      ? actor.roles
      : [];
    setFormData({
      name: actor?.name ?? "",
      fullName: actor?.fullName ?? "",
      dob: actor?.dob ?? "",
      dod: actor?.dod ?? "",
      characterId: "",
    });
    setSelectedCharacters(
      nextRoles.map((role) => (typeof role === "string" ? { name: role } : role)).filter(Boolean),
    );
    initialCharactersRef.current = nextRoles;
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

  const selectedCharacterKeys = useMemo(
    () => new Set(selectedCharacters.map((character) => getCharacterKey(character))),
    [selectedCharacters],
  );

  useEffect(() => {
    let isActive = true;

    async function loadCharacters() {
      setCharactersLoading(true);
      setCharactersError("");
      try {
        const data = await fetchCharacters({ q: "" });
        if (!isActive) return;
        setCharacterOptions(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!isActive) return;
        setCharactersError(err?.message ?? "Erro ao carregar personagens");
      } finally {
        if (isActive) setCharactersLoading(false);
      }
    }

    if (isEditing) {
      loadCharacters();
    }

    return () => {
      isActive = false;
    };
  }, [isEditing]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCharacterSelect = (event) => {
    const { value } = event.target;
    if (!value) return;
    const selected = characterOptions.find((character) => getCharacterKey(character) === value);
    if (!selected) return;
    setSelectedCharacters((prev) => {
      if (prev.some((character) => getCharacterKey(character) === value)) return prev;
      return [...prev, selected];
    });
    setFormData((prev) => ({ ...prev, characterId: "" }));
  };

  const handleRemoveCharacter = (key) => {
    setSelectedCharacters((prev) => prev.filter((character) => getCharacterKey(character) !== key));
  };

  const handleCancel = () => {
    setFormData({
      name: currentActor?.name ?? "",
      fullName: currentActor?.fullName ?? "",
      dob: currentActor?.dob ?? "",
      dod: currentActor?.dod ?? "",
      characterId: "",
    });
    setSelectedCharacters(
      roles.map((role) => (typeof role === "string" ? { name: role } : role)).filter(Boolean),
    );
    setIsEditing(false);
    setError("");
  };

  const handleEditClick = () => {
    if (isEditing) {
      handleCancel();
      return;
    }
    initialCharactersRef.current = selectedCharacters;
    setIsEditing(true);
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
      let updatedActor = updated?.actor ?? updated;
      const charactersChanged = !areCharactersEqual(selectedCharacters, initialCharactersRef.current);
      if (charactersChanged) {
        const updatedCharacters = await updateActorCharacters({
          actorId,
          characters: selectedCharacters,
        });
        const updatedCharactersActor = updatedCharacters?.actor ?? updatedCharacters;
        if (updatedCharactersActor && typeof updatedCharactersActor === "object") {
          updatedActor = { ...updatedActor, ...updatedCharactersActor };
        } else {
          updatedActor = { ...updatedActor, characters: selectedCharacters };
        }
      }
      setCurrentActor(updatedActor);
      if (onActorUpdated) {
        onActorUpdated(updatedActor);
      }
      setFormData({
        name: updatedActor?.name ?? formData.name,
        fullName: updatedActor?.fullName ?? formData.fullName,
        dob: updatedActor?.dob ?? formData.dob,
        dod: updatedActor?.dod ?? formData.dod,
        characterId: "",
      });
      setSelectedCharacters(
        Array.isArray(updatedActor?.characters)
          ? updatedActor.characters
          : Array.isArray(updatedActor?.roles)
          ? updatedActor.roles
          : selectedCharacters,
      );
      initialCharactersRef.current = selectedCharacters;
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
                onClick={handleEditClick}
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

        <form className="actor-details-modal__form" onSubmit={handleSubmit}>
          <div className="actor-details-modal__details">
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
          </div>

          <div className="actor-details-modal__section">
            <div className="actor-details-modal__section-title">Personagens</div>
            {isEditing && (
              <label className="actor-details-modal__field">
                <span className="actor-details-modal__label">Adicionar personagem</span>
                <select
                  className="actor-details-modal__input"
                  name="characterId"
                  value={formData.characterId}
                  onChange={handleCharacterSelect}
                >
                  <option value="" disabled>
                    {charactersLoading ? "Carregando personagens..." : "Selecione um personagem"}
                  </option>
                  {characterOptions.map((character, index) => {
                    const key = getCharacterKey(character) || String(index);
                    return (
                      <option key={key} value={key} disabled={selectedCharacterKeys.has(key)}>
                        {getCharacterLabel(character)}
                      </option>
                    );
                  })}
                </select>
              </label>
            )}
            {charactersError && <div className="actor-details-modal__error">Erro: {charactersError}</div>}
            {(isEditing ? selectedCharacters : roles).length === 0 ? (
              <div className="actor-details-modal__empty">Nenhum personagem cadastrado.</div>
            ) : (
              <div className="actor-details-modal__badges">
                {(isEditing ? selectedCharacters : roles).map((role) => {
                  const name = getCharacterLabel(role);
                  if (!name) return null;
                  const key = getCharacterKey(role);
                  return (
                    <Badge
                      key={key || name}
                      title={isEditing ? "Remover personagem" : name}
                      onClick={
                        isEditing
                          ? () => handleRemoveCharacter(key)
                          : onCharacterSelect
                          ? () => onCharacterSelect(typeof role === "string" ? { name } : role)
                          : undefined
                      }
                    >
                      {name} {isEditing && "×"}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

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
              <button
                className="actor-details-modal__button actor-details-modal__button--primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
