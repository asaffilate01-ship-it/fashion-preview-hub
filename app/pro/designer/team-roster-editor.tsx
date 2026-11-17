"use client";

import { useState } from "react";
import {
  exportTeamRosterCsv, MAX_TEAM_ROSTER_FILE_BYTES, MAX_TEAM_ROSTER_ROWS,
  parseTeamRosterCsv, rosterSizes, teamRosterSizeSummary, teamRosterTotal,
  type TeamRosterEntry,
} from "@/lib/team-roster";
import styles from "./designer.module.css";

type Props = { roster: TeamRosterEntry[]; onChange: (rows: TeamRosterEntry[]) => void; onPreview: (row: TeamRosterEntry) => void };
const blank: TeamRosterEntry = { name: "", number: "", size: "TBC", quantity: 1 };

export default function TeamRosterEditor({ roster, onChange, onPreview }: Props) {
  const [feedback, setFeedback] = useState("");

  const update = (index: number, patch: Partial<TeamRosterEntry>) => {
    onChange(roster.map((item, i) => i === index ? { ...item, ...patch } : item));
    setFeedback("");
  };

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_TEAM_ROSTER_FILE_BYTES) {
      setFeedback("CSV files must be 64 KB or smaller.");
      return;
    }
    try {
      const rows = parseTeamRosterCsv(await file.text());
      onChange(rows);
      setFeedback(`${rows.length} player entries imported and validated. Review them before continuing.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "The CSV could not be imported.");
    }
  };

  const exportFile = () => {
    try {
      const csv = exportTeamRosterCsv(roster);
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "kalethon-team-roster.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setFeedback("CSV exported. Keep the file private until you are ready to share it.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Complete the player details before exporting.");
    }
  };

  return (
    <section className={styles.rosterPanel} aria-labelledby="team-roster-heading">
      <div className={styles.rosterHeading}>
        <div>
          <p className={styles.eyebrow}>Club orders / Personalisation roster</p>
          <h2 id="team-roster-heading">Player names, numbers &amp; sizes</h2>
          <p>Enter players individually or import a CSV with columns <code>name,number,size,quantity</code>.
            Up to {MAX_TEAM_ROSTER_ROWS} rows per quotation. Every row must have a unique shirt number.</p>
        </div>
      </div>
      <div className={styles.rosterToolbar}>
        <button type="button" onClick={() => {
          if (roster.length >= MAX_TEAM_ROSTER_ROWS) { setFeedback("The roster has reached its 40-player limit."); return; }
          onChange([...roster, { ...blank }]);
          setFeedback("");
        }}>Add player</button>
        <label className={styles.rosterImport}>Import CSV
          <input type="file" accept=".csv,text/csv" aria-label="Import player roster CSV"
            onChange={(event) => { void importFile(event.target.files?.[0]); event.currentTarget.value = ""; }} />
        </label>
        <button type="button" onClick={exportFile}>Export CSV</button>
        <button type="button" onClick={() => { onChange([]); setFeedback("Roster cleared from this design. The saved browser draft, if any, is unchanged."); }}>Clear list</button>
      </div>
      {roster.length > 0 ? (
        <div className={styles.rosterTableScroll}>
          <table className={styles.rosterTable}>
            <caption className={styles.visuallyHidden}>Player roster editor</caption>
            <thead><tr><th scope="col">Player</th><th scope="col">Shirt no.</th><th scope="col">Size</th><th scope="col">Kits</th><th scope="col">Actions</th></tr></thead>
            <tbody>{roster.map((row, index) => (
              <tr key={index}>
                <td><input aria-label={`Player ${index + 1} name`} value={row.name} maxLength={25}
                  placeholder="Player name" onChange={(event) => update(index, { name: event.target.value })} /></td>
                <td><input aria-label={`Player ${index + 1} shirt number`} value={row.number} maxLength={2} inputMode="numeric"
                  onChange={(event) => { if (/^\d{0,2}$/.test(event.target.value)) update(index, { number: event.target.value }); }} /></td>
                <td><select aria-label={`Player ${index + 1} size`} value={row.size}
                  onChange={(event) => update(index, { size: event.target.value as TeamRosterEntry["size"] })}>
                  {rosterSizes.map((size) => <option key={size} value={size}>{size}</option>)}
                </select></td>
                <td><input aria-label={`Player ${index + 1} kit quantity`} type="number" inputMode="numeric"
                  min={1} max={20} step={1} value={row.quantity}
                  onChange={(event) => update(index, { quantity: Number(event.target.value) })} /></td>
                <td className={styles.rosterActions}>
                  <button type="button" onClick={() => onPreview(row)} title="Show player on concept preview">Preview</button>
                  <button type="button" onClick={() => { onChange(roster.filter((_, i) => i !== index)); setFeedback(""); }}>Remove</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <p className={styles.rosterEmpty}>No players added yet. The kit designer can still be used for a general quotation.</p>
      )}
      {roster.length > 0 && <p className={styles.rosterTotals}>
        <strong>{roster.length} player entries · {teamRosterTotal(roster)} kits</strong>
        <span>Size breakdown: {teamRosterSizeSummary(roster)}</span>
      </p>}
      <p className={styles.feedback} role="status" aria-live="polite">{feedback}</p>
      <p className={styles.rosterPrivacy}>Player details stay in this browser until you deliberately submit a quote.
        Save creates a local browser draft; import and export are performed locally.
        Youth sizes and all garment measurements must be confirmed before production.</p>
    </section>
  );
}
