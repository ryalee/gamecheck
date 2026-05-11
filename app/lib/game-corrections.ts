const GAME_ALIASES: Record<string, string> = {
  "red dead 2": "Red Dead Redemption 2",
  rdr2: "Red Dead Redemption 2",
  "red dead redemption ii": "Red Dead Redemption 2",
  "gta 6": "Grand Theft Auto VI",
  "gta vi": "Grand Theft Auto VI",
  "gta 5": "Grand Theft Auto V",
  "gta v": "Grand Theft Auto V",
  "cs 2": "Counter-Strike 2",
  cs2: "Counter-Strike 2",
  csgo: "Counter-Strike 2",
  lol: "League of Legends",
  bg3: "Baldur's Gate 3",
};

export function normalizeQuery(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getCanonicalQuery(query: string): string {
  const normalizedQuery = normalizeQuery(query);
  if (GAME_ALIASES[normalizedQuery]) {
    return GAME_ALIASES[normalizedQuery];
  }
  const includedAlias = Object.entries(GAME_ALIASES).find(([key]) =>
    normalizedQuery.includes(key),
  );
  return includedAlias?.[1] || query.trim();
}

export function allowsAddons(query: string) {
  const normalized = normalizeQuery(query);
  return /\b(dlc|expansion|expansao|expansão|addon|add on|season pass)\b/.test(
    normalized,
  );
}
