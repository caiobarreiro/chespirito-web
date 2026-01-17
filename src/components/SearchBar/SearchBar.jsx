import "./SearchBar.scss";

export default function SearchBar({ value, onChange, onSubmit, loading, placeholder }) {
  return (
    <form className="searchbar" onSubmit={onSubmit}>
      <input
        className="searchbar__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          placeholder ?? "Digite: florinda, renta, aluguel, torta de jamón… (vazio = lista tudo)"
        }
      />
      <button className="searchbar__btn" type="submit" disabled={loading}>
        {loading ? "Buscando..." : "Buscar"}
      </button>
    </form>
  );
}
