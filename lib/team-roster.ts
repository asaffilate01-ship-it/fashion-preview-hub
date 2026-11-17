export const MAX_TEAM_ROSTER_ROWS = 40;
export const MAX_TEAM_ROSTER_FILE_BYTES = 64 * 1024;
export const TEAM_ROSTER_SESSION_KEY = "kalethon-team-roster-quote-v1";
export const TEAM_ROSTER_DRAFT_VERSION = 1;

export const rosterSizes = [
  "TBC", "Youth 6-8", "Youth 9-11", "Youth 12-14",
  "XS", "S", "M", "L", "XL", "2XL", "3XL",
] as const;

export type TeamRosterEntry = {
  name: string;
  number: string;
  size: (typeof rosterSizes)[number];
  quantity: number;
};

export class RosterValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RosterValidationError";
  }
}

function dataRow(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateTeamRoster(input: unknown): TeamRosterEntry[] {
  if (!Array.isArray(input)) throw new RosterValidationError("The player list must be an array.");
  if (input.length > MAX_TEAM_ROSTER_ROWS) {
    throw new RosterValidationError(`Use up to ${MAX_TEAM_ROSTER_ROWS} player entries in one quotation. Additional rosters can be discussed with our team.`);
  }
  const seenNumbers = new Set<string>();
  return input.map((entry, i) => {
    if (!dataRow(entry)) throw new RosterValidationError(`Player row ${i + 1} is invalid.`);
    const name = typeof entry.name === "string" ? entry.name.trim().replace(/\s+/g, " ") : "";
    const number = typeof entry.number === "string" || typeof entry.number === "number"
      ? String(entry.number).trim() : "";
    const size = entry.size;
    const quantity = Number(entry.quantity === undefined || entry.quantity === "" ? 1 : entry.quantity);
    if (name.length < 1 || name.length > 25 || !/^[\p{L}\p{M}\p{N} .'-]+$/u.test(name)) {
      throw new RosterValidationError(`Player row ${i + 1}: use a valid name (up to 25 characters).`);
    }
    if (!/^(?:[0-9]|[1-9][0-9]|00)$/.test(number)) {
      throw new RosterValidationError(`Player row ${i + 1}: use a shirt number from 0 to 99 (or 00).`);
    }
    if (seenNumbers.has(number)) {
      throw new RosterValidationError(`Shirt number ${number} is assigned more than once. Check the roster before requesting a quotation.`);
    }
    seenNumbers.add(number);
    if (!rosterSizes.some((option) => option === size)) {
      throw new RosterValidationError(`Player row ${i + 1}: select a valid size or TBC.`);
    }
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new RosterValidationError(`Player row ${i + 1}: quantity must be between 1 and 20.`);
    }
    return { name, number, size: size as TeamRosterEntry["size"], quantity };
  });
}

function parseCsvRecords(input: string): string[][] {
  if (new TextEncoder().encode(input).byteLength > MAX_TEAM_ROSTER_FILE_BYTES) {
    throw new RosterValidationError("The CSV is too large. The maximum is 64 KB.");
  }
  const records: string[][] = [];
  let record: string[] = [], field = "", quoted = false;
  const content = input.replace(/^\uFEFF/, "");
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (quoted) {
      if (ch === '"') {
        if (content[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += ch;
    } else if (ch === '"') {
      if (field !== "") throw new RosterValidationError("Invalid CSV quote escaping.");
      quoted = true;
    } else if (ch === ",") {
      record.push(field); field = "";
    } else if (ch === "\n" || ch === "\r") {
      record.push(field); field = "";
      if (record.some((item) => item.trim() !== "")) records.push(record);
      record = [];
      if (ch === "\r" && content[i + 1] === "\n") i++;
    } else field += ch;
    if (field.length > 512) throw new RosterValidationError("A CSV field is too long.");
  }
  if (quoted) throw new RosterValidationError("CSV file contains an unclosed quoted field.");
  record.push(field);
  if (record.some((item) => item.trim() !== "")) records.push(record);
  return records;
}

export function parseTeamRosterCsv(content: string): TeamRosterEntry[] {
  const records = parseCsvRecords(content);
  if (records.length < 2) throw new RosterValidationError("Please provide a CSV header and at least one player.");
  const fields = records[0].map((value) => value.toLowerCase().trim().replace(/\s+/g, " "));
  const index = (aliases: string[]) => fields.findIndex((field) => aliases.includes(field));
  const name = index(["name", "player", "player name"]);
  const number = index(["number", "shirt number", "jersey number"]);
  const size = index(["size", "shirt size"]);
  const quantity = index(["quantity", "qty", "kits"]);
  if (name < 0 || number < 0 || size < 0) {
    throw new RosterValidationError("CSV columns must include name, number, size; quantity is optional.");
  }
  if (records.length - 1 > MAX_TEAM_ROSTER_ROWS) {
    throw new RosterValidationError(`The CSV has more than ${MAX_TEAM_ROSTER_ROWS} players. Please split it into smaller rosters.`);
  }
  return validateTeamRoster(records.slice(1).map((row) => ({
    name: row[name] ?? "",
    number: row[number] ?? "",
    size: row[size] ?? "",
    quantity: quantity >= 0 ? row[quantity] ?? 1 : 1,
  })));
}

export function teamRosterTotal(rows: TeamRosterEntry[]): number {
  return rows.reduce((sum, row) => sum + row.quantity, 0);
}

export function teamRosterSizeSummary(rows: TeamRosterEntry[]): string {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.size, (counts.get(row.size) ?? 0) + row.quantity);
  return [...counts].map(([size, total]) => `${size}: ${total}`).join(", ");
}

function csvCell(value: string | number): string {
  // Keep Excel, Sheets and other spreadsheet software from interpreting fields as formulas.
  const raw = String(value);
  const safe = /^[=+\-@\t\r\n]/.test(raw) ? "'" + raw : raw;
  return '"' + safe.replace(/"/g, '""') + '"';
}

export function exportTeamRosterCsv(rows: TeamRosterEntry[]): string {
  const validated = validateTeamRoster(rows);
  return ["name,number,size,quantity", ...validated.map((row) =>
    [row.name, row.number, row.size, row.quantity].map(csvCell).join(",")
  )].join("\r\n") + "\r\n";
}
