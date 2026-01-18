const API_BASE = import.meta.env.VITE_API_BASE_URL;

function requireApiBase() {
  if (!API_BASE) {
    throw new Error("VITE_API_BASE_URL is not defined");
  }
  return API_BASE;
}

export async function fetchEpisodes({ q }) {
  const base = requireApiBase();

  // NÃO comece com "/" aqui
  const url = new URL("episodes", base);

  const qq = (q ?? "").trim();
  if (qq) url.searchParams.set("q", qq);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchActors({ q }) {
  const base = requireApiBase();

  // NÃO comece com "/" aqui
  const url = new URL("actors", base);

  const qq = (q ?? "").trim();
  if (qq) url.searchParams.set("q", qq);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchCharacters({ q }) {
  const base = requireApiBase();

  // NÃO comece com "/" aqui
  const url = new URL("characters", base);

  const qq = (q ?? "").trim();
  if (qq) url.searchParams.set("q", qq);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchEpisodesByCharacter({ characterId }) {
  const base = requireApiBase();

  // NÃO comece com "/" aqui
  const url = new URL("episodes", base);
  if (characterId) url.searchParams.set("characters", characterId);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchEpisodesByShow({ showId }) {
  const base = requireApiBase();

  // NÃO comece com "/" aqui
  const url = new URL("episodes", base);
  if (showId) url.searchParams.set("showId", showId);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
