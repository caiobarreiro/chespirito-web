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

export async function fetchCharacter({ characterId }) {
  const base = requireApiBase();

  if (!characterId) {
    throw new Error("characterId is required");
  }

  const url = new URL(`characters/${characterId}`, base);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchShows({ q }) {
  const base = requireApiBase();

  // NÃO comece com "/" aqui
  const url = new URL("shows", base);

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

export async function createActor({ name, fullName, dob, dod }) {
  const base = requireApiBase();

  // NÃO comece com "/" aqui
  const url = new URL("actors", base);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      fullName,
      dob,
      dod,
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createCharacter({ name, nameEs, actor }) {
  const base = requireApiBase();

  // NÃO comece com "/" aqui
  const url = new URL("characters", base);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      nameEs,
      actor,
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createShow({ name, nameEs, startDate, endDate }) {
  const base = requireApiBase();

  // NÃO comece com "/" aqui
  const url = new URL("shows", base);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      nameEs,
      startDate,
      endDate,
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createEpisode({
  show,
  episodeNumber,
  season,
  airDate,
  title,
  titleES,
  synopsisPT,
  synopsisEs,
}) {
  const base = requireApiBase();

  // NÃO comece com "/" aqui
  const url = new URL("episodes", base);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      show,
      episodeNumber,
      season,
      airDate,
      title,
      titleES,
      synopsisPT,
      synopsisEs,
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateActor({ id, name, fullName, dob, dod }) {
  const base = requireApiBase();

  if (!id) {
    throw new Error("id is required");
  }

  const url = new URL(`actors/${id}`, base);

  const res = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      name,
      fullName,
      dob,
      dod,
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateActorCharacters({ actorId, characters }) {
  const base = requireApiBase();

  if (!actorId) {
    throw new Error("actorId is required");
  }

  const url = new URL(`actors/${actorId}/characters`, base);

  const res = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(characters ?? []),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateEpisodeCharacters({ episodeId, characters }) {
  const base = requireApiBase();

  const url = new URL(`episodes/${episodeId}/characters`, base);

  const res = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(characters ?? []),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
