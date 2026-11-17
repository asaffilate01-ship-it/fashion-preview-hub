export const teamSports = [
  { id: "football", label: "Football", product: "Football match kits" },
  { id: "cricket", label: "Cricket", product: "Cricket coloured kits" },
  { id: "rugby", label: "Rugby", product: "Rugby kits" },
  { id: "basketball", label: "Basketball", product: "Basketball kits" },
  { id: "volleyball", label: "Volleyball", product: "Volleyball kits" },
] as const;

export const teamColours = [
  { id: "navy", label: "Navy", hex: "#243955" },
  { id: "oxblood", label: "Oxblood", hex: "#75283c" },
  { id: "cream", label: "Ivory", hex: "#eeebe0" },
  { id: "forest", label: "Forest", hex: "#254737" },
  { id: "black", label: "Ink", hex: "#202325" },
  { id: "gold", label: "Gold", hex: "#c4a469" },
  { id: "sky", label: "Sky", hex: "#86b7cd" },
  { id: "white", label: "White", hex: "#ffffff" },
] as const;

export const teamPatterns = [
  { id: "plain", label: "Plain" },
  { id: "vertical", label: "Vertical stripes" },
  { id: "hoops", label: "Horizontal hoops" },
  { id: "chevron", label: "Chevron" },
] as const;

export type TeamSport = (typeof teamSports)[number]["id"];
export type TeamColour = (typeof teamColours)[number]["id"];
export type TeamPattern = (typeof teamPatterns)[number]["id"];

export type TeamDesign = {
  sport: TeamSport;
  primary: TeamColour;
  secondary: TeamColour;
  pattern: TeamPattern;
  teamName: string;
  playerName: string;
  playerNumber: string;
  quantity: number;
};

export const defaultTeamDesign: TeamDesign = {
  sport: "football",
  primary: "navy",
  secondary: "cream",
  pattern: "vertical",
  teamName: "YOUR CLUB",
  playerName: "PLAYER",
  playerNumber: "10",
  quantity: 25,
};

function textValue(value: unknown, length: number): string {
  return typeof value === "string"
    ? value.replace(/[\x00-\x1f\x7f]/g, " ").replace(/\s+/g, " ").trim().slice(0, length)
    : "";
}

function matchOption<T extends { id: string }>(options: readonly T[], value: unknown, fallback: T["id"]): T["id"] {
  return options.find((option) => option.id === value)?.id ?? fallback;
}

export function normaliseTeamDesign(input: unknown): TeamDesign {
  const values = input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const quantity = Number(values.quantity);
  const teamName = textValue(values.teamName, 28);
  const playerName = textValue(values.playerName, 18);
  const playerNumber = textValue(values.playerNumber, 2);
  return {
    sport: matchOption(teamSports, values.sport, defaultTeamDesign.sport) as TeamSport,
    primary: matchOption(teamColours, values.primary, defaultTeamDesign.primary) as TeamColour,
    secondary: matchOption(teamColours, values.secondary, defaultTeamDesign.secondary) as TeamColour,
    pattern: matchOption(teamPatterns, values.pattern, defaultTeamDesign.pattern) as TeamPattern,
    teamName: teamName || defaultTeamDesign.teamName,
    playerName: playerName || defaultTeamDesign.playerName,
    playerNumber: /^(?:[0-9]|[1-9][0-9])$/.test(playerNumber) ? playerNumber : defaultTeamDesign.playerNumber,
    quantity: Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= 10000 ? quantity : defaultTeamDesign.quantity,
  };
}

export function teamDesignQuoteHref(design: TeamDesign): string {
  const safe = normaliseTeamDesign(design);
  const sport = teamSports.find((item) => item.id === safe.sport)!;
  return "/pro/quote?" + new URLSearchParams({
    source: "kit-designer",
    department: "team-pro",
    category: "Team kits",
    product: sport.product,
    sport: safe.sport,
    primary: safe.primary,
    secondary: safe.secondary,
    pattern: safe.pattern,
    teamName: safe.teamName,
    playerName: safe.playerName,
    playerNumber: safe.playerNumber,
    quantity: String(safe.quantity),
  }).toString();
}

export function teamDesignQuotePrefill(query: Record<string, string | string[] | undefined>) {
  if (query.source !== "kit-designer" || query.department !== "team-pro") return null;
  const safe = normaliseTeamDesign(query);
  const sport = teamSports.find((item) => item.id === safe.sport)!;
  const primary = teamColours.find((item) => item.id === safe.primary)!;
  const secondary = teamColours.find((item) => item.id === safe.secondary)!;
  const pattern = teamPatterns.find((item) => item.id === safe.pattern)!;
  const notes = [
    "Team & Pro visual design brief (concept preview only; not an approved production specification).",
    "Sport: " + sport.label,
    "Team: " + safe.teamName,
    "Base colour: " + primary.label,
    "Trim colour: " + secondary.label,
    "Pattern: " + pattern.label,
    "Sample player name: " + safe.playerName,
    "Sample player number: " + safe.playerNumber,
    "Estimated kits: " + safe.quantity,
    "Please confirm materials, crest/sponsor artwork, roster, size quantities, lead time and a production proof before ordering.",
  ].join("\n");
  return { quantity: safe.quantity, notes, product: sport.product };
}
