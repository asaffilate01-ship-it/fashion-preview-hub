"use client";

import { useState } from "react";
import Link from "next/link";
import TeamRosterEditor from "./team-roster-editor";
import { TEAM_ROSTER_SESSION_KEY, TEAM_ROSTER_DRAFT_VERSION, validateTeamRoster, teamRosterTotal, type TeamRosterEntry } from "@/lib/team-roster";
import {
  defaultTeamDesign, normaliseTeamDesign, teamColours, teamPatterns, teamSports,
  teamDesignQuoteHref, type TeamDesign, type TeamColour, type TeamPattern, type TeamSport,
} from "@/lib/team-designer";
import styles from "./designer.module.css";

const storageKey = "kalethon-team-design-v1";
const mainShape = "M119 79 L145 64 H213 L239 79 L295 104 L326 163 L270 196 L246 161 L246 327 L112 327 L112 161 L88 196 L32 163 L63 104 Z";
const vestShape = "M135 64 L145 64 H213 L224 64 L243 100 L243 327 H115 V100 Z";
const shortsShape = "M113 335 H245 L266 414 L191 416 L178 368 L164 416 L92 414 Z";

function hex(colour: TeamColour) {
  return teamColours.find((item) => item.id === colour)?.hex ?? "#243955";
}

function KitMockup({ design, side }: { design: TeamDesign; side: "front" | "back" }) {
  const shirt = design.sport === "basketball" ? vestShape : mainShape;
  const clipId = "shirt-preview-" + side;
  const main = hex(design.primary);
  const contrast = hex(design.secondary);
  const lightInk = ["navy", "oxblood", "forest", "black"].includes(design.primary);
  const textInk = lightInk ? "#f9f7f0" : "#172735";
  const teamFont = Math.min(21, 310 / Math.max(1, design.teamName.length));
  const nameFont = Math.min(22, 270 / Math.max(1, design.playerName.length));

  return (
    <svg className={styles.mockupSvg} viewBox="0 0 360 460" role="img"
      aria-label={side === "front" ? "Front concept preview of your customised sports kit" : "Back concept preview of your customised sports kit"}>
      <defs><clipPath id={clipId}><path d={shirt} /></clipPath></defs>
      <ellipse cx="178" cy="430" rx="122" ry="10" fill="#1a1d1e" fillOpacity=".12" />
      <path d={shirt} fill={main} stroke="#333c42" strokeWidth="3" />
      <g clipPath={"url(#" + clipId + ")"}>
        {design.pattern === "vertical" && [82, 142, 203, 263].map((x) => (
          <rect x={x} y="62" width="27" height="270" fill={contrast} key={x} opacity=".93" />
        ))}
        {design.pattern === "hoops" && [130, 203, 276].map((y) => (
          <rect x="26" y={y} width="310" height="32" fill={contrast} key={y} opacity=".93" />
        ))}
        {design.pattern === "chevron" && (
          <g fill="none" stroke={contrast} strokeWidth="30" opacity=".93">
            <path d="M45 131L178 253L316 131" />
            <path d="M45 190L178 312L316 190" />
          </g>
        )}
      </g>
      <path d="M143 65 Q179 102 215 65" fill="none" stroke={contrast} strokeWidth="8" />
      {design.sport !== "basketball" && <>
        <path d="M64 107 L90 194 M294 107 L269 194" stroke={contrast} strokeWidth="8" fill="none" />
      </>}
      {side === "front" ? (
        <>
          <circle cx="220" cy="135" r="15" fill="#f4f1e8" fillOpacity=".94" />
          <text x="220" y="141" fontSize="17" textAnchor="middle" fill="#243955" fontFamily="Georgia, serif">K</text>
          <text x="180" y="182" textAnchor="middle" fill={textInk} fontSize={teamFont}
            fontWeight="700" letterSpacing="1">{design.teamName.toUpperCase()}</text>
          <text x="180" y="260" textAnchor="middle" fill={textInk} fontSize="73" fontWeight="800">{design.playerNumber || "10"}</text>
        </>
      ) : (
        <>
          <text x="180" y="143" textAnchor="middle" fill={textInk} fontSize={nameFont} fontWeight="800"
            letterSpacing="1">{design.playerName.toUpperCase()}</text>
          <text x="180" y="258" textAnchor="middle" fill={textInk} fontSize="91" fontWeight="800">{design.playerNumber || "10"}</text>
          <text x="180" y="302" textAnchor="middle" fill={textInk} fontSize="13" letterSpacing="3">KALËTHON</text>
        </>
      )}
      <path d={shortsShape} fill={main} stroke="#333c42" strokeWidth="3" />
      <path d="M113 344 H245" stroke={contrast} strokeWidth="12" />
      <path d="M105 398 L124 403 M233 403 L252 398" stroke={contrast} strokeWidth="11" />
      <text x="180" y="451" fontSize="11" textAnchor="middle" fill="#545d57" letterSpacing="2">
        {side.toUpperCase()} / VISUAL CONCEPT
      </text>
    </svg>
  );
}

export default function TeamKitDesigner() {
  const [design, setDesign] = useState<TeamDesign>(defaultTeamDesign);
  const [draftMessage, setDraftMessage] = useState("");
  const [roster, setRoster] = useState<TeamRosterEntry[]>([]);
  const rosterError = (() => {
    try { validateTeamRoster(roster); return ""; }
    catch (error) { return error instanceof Error ? error.message : "Please check the roster."; }
  })();
  const assignedKits = teamRosterTotal(roster);

  const update = <K extends keyof TeamDesign>(key: K, value: TeamDesign[K]) => {
    setDesign((old) => ({ ...old, [key]: value }));
    setDraftMessage("");
  };

  const save = () => {
    try {
      const validRoster = validateTeamRoster(roster);
      window.localStorage.setItem(storageKey, JSON.stringify({
        version: TEAM_ROSTER_DRAFT_VERSION,
        design: normaliseTeamDesign(design),
        roster: validRoster,
      }));
      setDraftMessage("Design and player roster saved in this browser. Nothing has been sent to KALËTHON.");
    } catch (error) {
      setDraftMessage(error instanceof Error ? error.message : "The local draft could not be saved.");
    }
  };
  const load = () => {
    try {
      const item = window.localStorage.getItem(storageKey);
      if (!item) {
        setDraftMessage("No saved kit design was found in this browser.");
        return;
      }
      const parsed: unknown = JSON.parse(item);
      if (parsed && typeof parsed === "object" && "design" in parsed) {
        const entry = parsed as { design: unknown; roster?: unknown };
        const validRoster = validateTeamRoster(entry.roster ?? []);
        setDesign(normaliseTeamDesign(entry.design));
        setRoster(validRoster);
      } else {
        // Legacy design-only drafts continue to load.
        setDesign(normaliseTeamDesign(parsed));
        setRoster([]);
      }
      setDraftMessage("Your browser-saved design and roster are loaded.");
    } catch {
      setDraftMessage("Your saved design could not be read.");
    }
  };

  const effectiveQuantity = Math.max(design.quantity || 0, assignedKits);
  const quoteHref = teamDesignQuoteHref({ ...design, playerName: roster.length ? "PLAYER" : design.playerName, playerNumber: roster.length ? "10" : design.playerNumber, quantity: effectiveQuantity }) + (roster.length ? "&roster=1" : "");
  const continueToQuote = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (rosterError) {
      event.preventDefault();
      setDraftMessage(rosterError);
      return;
    }
    try {
      if (roster.length) {
        window.sessionStorage.setItem(TEAM_ROSTER_SESSION_KEY, JSON.stringify({
          version: TEAM_ROSTER_DRAFT_VERSION,
          savedAt: Date.now(),
          roster: validateTeamRoster(roster),
        }));
      } else {
        window.sessionStorage.removeItem(TEAM_ROSTER_SESSION_KEY);
      }
    } catch {
      event.preventDefault();
      setDraftMessage("Your browser cannot pass the roster to the quote form. Please enable session storage or clear the roster.");
    }
  };

  return (
    <div className={styles.layout}>
      <section className={styles.controls} aria-labelledby="designer-controls">
        <div className={styles.heading}>
          <p className={styles.eyebrow}>KALËTHON / Team & Pro</p>
          <h1 id="designer-controls">Create your <em>team identity.</em></h1>
          <p>Explore a kit concept with your team&apos;s colours, pattern, names and numbers.
            The preview is for discussion only — final templates, dimensions, printing and materials require approval.</p>
        </div>
        <div className={styles.formGroups}>
          <label className={styles.field} htmlFor="kit-sport">Sport
            <select id="kit-sport" value={design.sport} onChange={(event) => update("sport", event.target.value as TeamSport)}>
              {teamSports.map((sport) => <option key={sport.id} value={sport.id}>{sport.label}</option>)}
            </select>
          </label>
          <fieldset className={styles.group}>
            <legend>Main colour</legend>
            <div className={styles.colourGrid}>
              {teamColours.map((colour) => (
                <button key={colour.id} type="button" className={styles.swatch}
                  aria-label={"Main colour " + colour.label} aria-pressed={design.primary === colour.id}
                  onClick={() => update("primary", colour.id)}>
                  <span className={styles.colourTile} style={{ backgroundColor: colour.hex }} />
                  <span>{colour.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className={styles.group}>
            <legend>Trim colour</legend>
            <div className={styles.colourGrid}>
              {teamColours.map((colour) => (
                <button key={colour.id} type="button" className={styles.swatch}
                  aria-label={"Trim colour " + colour.label} aria-pressed={design.secondary === colour.id}
                  onClick={() => update("secondary", colour.id)}>
                  <span className={styles.colourTile} style={{ backgroundColor: colour.hex }} />
                  <span>{colour.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className={styles.group}>
            <legend>Pattern</legend>
            <div className={styles.patternGrid}>
              {teamPatterns.map((pattern) => (
                <button key={pattern.id} type="button" className={styles.patternButton}
                  aria-pressed={design.pattern === pattern.id}
                  onClick={() => update("pattern", pattern.id as TeamPattern)}>{pattern.label}</button>
              ))}
            </div>
          </fieldset>
          <div className={styles.fieldsGrid}>
            <label className={styles.field} htmlFor="kit-team">Team name
              <input id="kit-team" maxLength={28} value={design.teamName}
                onChange={(event) => update("teamName", event.target.value)} />
            </label>
            <label className={styles.field} htmlFor="kit-player">Sample player name
              <input id="kit-player" maxLength={18} value={design.playerName}
                onChange={(event) => update("playerName", event.target.value)} />
            </label>
            <label className={styles.field} htmlFor="kit-number">Sample shirt number
              <input id="kit-number" inputMode="numeric" maxLength={2}
                value={design.playerNumber} onChange={(event) => {
                  if (/^\d{0,2}$/.test(event.target.value)) update("playerNumber", event.target.value);
                }} />
            </label>
            <label className={styles.field} htmlFor="kit-quantity">Estimated kit quantity
              <input id="kit-quantity" type="number" min={1} max={10000} step={1}
                value={design.quantity} onChange={(event) => update("quantity", Number(event.target.value))} />
            </label>
          </div>
        </div>
        <TeamRosterEditor roster={roster} onChange={(rows) => { setRoster(rows); setDraftMessage(""); }}
          onPreview={(row) => { update("playerName", row.name); update("playerNumber", row.number); }} />
        <div className={styles.actions}>
          {rosterError && <p className={styles.rosterError} role="alert">{rosterError}</p>}
          {assignedKits > design.quantity && <p className={styles.rosterInfo}>
            Estimated kit quantity will increase to {assignedKits} to cover the player roster.
          </p>}
          <Link className={styles.quoteButton} href={quoteHref} onClick={continueToQuote}
            aria-disabled={Boolean(rosterError)}>Continue to quotation <span aria-hidden="true">↗</span></Link>
          <div className={styles.secondaryActions}>
            <button type="button" onClick={save}>Save in this browser</button>
            <button type="button" onClick={load}>Load saved design</button>
            <button type="button" onClick={() => { setDesign(defaultTeamDesign); setRoster([]); setDraftMessage("Design and roster reset. Any previously saved browser draft is unchanged."); }}>Reset</button>
            <button type="button" onClick={() => {
              window.localStorage.removeItem(storageKey);
              window.sessionStorage.removeItem(TEAM_ROSTER_SESSION_KEY);
              setDraftMessage("Saved drafts cleared from this browser.");
            }}>Delete saved draft</button>
          </div>
          <p className={styles.feedback} role="status" aria-live="polite">{draftMessage}</p>
          <p className={styles.caution}>No payment is taken. This is not a manufacturing-ready pattern,
            official club crest, licensed kit, or confirmed order. A quote and artwork approval are required.</p>
        </div>
      </section>
      <aside className={styles.preview} aria-label="Live kit concept preview">
        <div className={styles.previewHeading}>
          <span>KALËTHON / ORIGINAL CONCEPT STUDIO</span>
          <strong>Live design preview</strong>
          <p>Front and back views update with your selections.</p>
        </div>
        <div className={styles.mockupGrid}>
          <KitMockup design={design} side="front" />
          <KitMockup design={design} side="back" />
        </div>
        <p className={styles.previewFootnote}>Digital illustration. Final cuts, sleeve shape,
          pant design, crest placement, fabric construction and print files may differ by sport.</p>
      </aside>
    </div>
  );
}
