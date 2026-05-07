/** פרסור CSV בסיסי (כולל שדות במרכאות, BOM, פסיק או נקודה-פסיק כמו בייצוא אקסל אירופאי) */

function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) return text.slice(1);
  return text;
}

export function parseCsvLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === delimiter && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

export function detectDelimiter(sampleLine: string): "," | ";" {
  const commas = (sampleLine.match(/,/g) ?? []).length;
  const semis = (sampleLine.match(/;/g) ?? []).length;
  return semis > commas ? ";" : ",";
}

/** מפצל לשורות תוך התחשבות במרכאות (שדה עם שורה פנימית) */
export function splitCsvRows(text: string): string[] {
  const rows: string[] = [];
  let cur = "";
  let inQuotes = false;
  const t = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '"') {
      if (inQuotes && t[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "\n" && !inQuotes) {
      if (cur.length > 0 || rows.length === 0) rows.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  if (cur.length > 0 || rows.length === 0) rows.push(cur);
  return rows.filter((r) => r.trim().length > 0);
}

export type ParsedCsv = {
  delimiter: "," | ";";
  headers: string[];
  rows: Record<string, string>[];
};

export function parseCsvToRecords(text: string): ParsedCsv {
  const raw = stripBom(text.trim());
  if (!raw) {
    return { delimiter: ",", headers: [], rows: [] };
  }
  const lines = splitCsvRows(raw);
  if (lines.length === 0) {
    return { delimiter: ",", headers: [], rows: [] };
  }
  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let li = 1; li < lines.length; li++) {
    const cells = parseCsvLine(lines[li], delimiter);
    if (cells.every((c) => c === "")) continue;
    const row: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      const key = headers[i] || `_col${i}`;
      row[key] = cells[i] ?? "";
    }
    rows.push(row);
  }
  return { delimiter, headers, rows };
}
