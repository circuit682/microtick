import type { RouterOsSessionInterval } from "./RouterOsSessionInterval.js";

export interface RouterOsHotspotLogEntry {
  time?: string;
  topics?: string;
  message?: string;
}

function parseLogTime(value: string, now: Date): Date | null {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/,
  );

  if (match) {
    return new Date(
      Date.UTC(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        Number(match[4]),
        Number(match[5]),
        Number(match[6]),
      ),
    );
  }

  const isoTime = new Date(value);

  if (!Number.isNaN(isoTime.getTime())) {
    return isoTime;
  }

  const shortMatch = value.match(
    /^([A-Za-z]{3})\/(\d{1,2})[ T](\d{2}):(\d{2}):(\d{2})$/,
  );

  if (!shortMatch) {
    return null;
  }

  const month = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ].indexOf(shortMatch[1]!.toLowerCase());

  if (month < 0) {
    return null;
  }

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      month,
      Number(shortMatch[2]),
      Number(shortMatch[3]),
      Number(shortMatch[4]),
      Number(shortMatch[5]),
    ),
  );
}

function getHotspotEvent(
  entry: RouterOsHotspotLogEntry,
  now: Date,
): { username: string; kind: "login" | "logout"; at: Date } | null {
  if (!entry.message || !entry.time) {
    return null;
  }

  const match = entry.message.match(
    /^(\S+) \([^)]*\): logged (in|out)(?::.*)?$/,
  );

  if (!match) {
    return null;
  }

  const at = parseLogTime(entry.time, now);

  if (at === null) {
    return null;
  }

  return {
    username: match[1]!,
    kind: match[2] === "in" ? "login" : "logout",
    at,
  };
}

export function completedIntervalsFromHotspotLogs(
  entries: RouterOsHotspotLogEntry[],
  now: Date,
): RouterOsSessionInterval[] {
  const openSessions = new Map<string, Date>();
  const intervals: RouterOsSessionInterval[] = [];
  const events = entries
    .filter(
      (entry) => entry.topics === undefined || entry.topics.includes("hotspot"),
    )
    .map((entry) => getHotspotEvent(entry, now))
    .filter((event) => event !== null)
    .sort((left, right) => left.at.getTime() - right.at.getTime());

  for (const event of events) {
    if (event.kind === "login") {
      openSessions.set(event.username, event.at);
      continue;
    }

    const connectedAt = openSessions.get(event.username);

    if (connectedAt === undefined || event.at < connectedAt) {
      continue;
    }

    intervals.push({
      sessionId: `hotspot:${event.username}:${connectedAt.toISOString()}`,
      username: event.username,
      connectedAt,
      disconnectedAt: event.at,
    });
    openSessions.delete(event.username);
  }

  return intervals;
}
