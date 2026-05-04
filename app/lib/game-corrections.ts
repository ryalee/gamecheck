export const GAME_CORRECTIONS: Record<string, string> = {
  // Red Dead
  "red dead 2": "Red Dead Redemption 2",
  rdr2: "Red Dead Redemption 2",
  "red dead redemption 2": "Red Dead Redemption 2",
  "red dead redemption ii": "Red Dead Redemption 2",

  // Cyberpunk
  cyberpunk: "Cyberpunk 2077",
  "cyberpunk 2077": "Cyberpunk 2077",

  // GTA
  "gta 6": "Grand Theft Auto VI",
  "gta vi": "Grand Theft Auto VI",
  "gta 5": "Grand Theft Auto V",
  "gta v": "Grand Theft Auto V",

  // Others
  cod: "Call of Duty: Modern Warfare III",
  minecraft: "Minecraft",
  csgo: "Counter-Strike 2",
  "cs 2": "Counter-Strike 2",
  cs: "Counter-Strike 2",
  dota: "Dota 2",
  valorant: "Valorant",
  fortnite: "Fortnite",
  "among us": "Among Us",
  roblox: "Roblox",
  wow: "World of Warcraft",
  league: "League of Legends",
  lol: "League of Legends",
  "elden ring": "Elden Ring",
  hogwarts: "Hogwarts Legacy",
  starfield: "Starfield",
  "baldurs gate": "Baldur's Gate 3",
  "baldurs gate 3": "Baldur's Gate 3",
  bg3: "Baldur's Gate 3",
};

export function getCorrectedQuery(query: string): string[] {
  const lowerQuery = query.toLowerCase().trim();

  // Check exact corrections
  if (GAME_CORRECTIONS[lowerQuery]) {
    return [GAME_CORRECTIONS[lowerQuery]];
  }

  // Fallback variants
  const variants = [
    query,
    query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim(),
    query.charAt(0).toUpperCase() + query.slice(1),
  ];

  // Remove duplicates and empty
  return [...new Set(variants)].filter(Boolean);
}
