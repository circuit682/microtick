import { describe, expect, it } from "vitest";

import { completedIntervalsFromHotspotLogs } from "@application/access/RouterOsHotspotSessionLog.js";

describe("completedIntervalsFromHotspotLogs", () => {
  it("interprets CHR UTC timestamps and pairs login/logout events", () => {
    const intervals = completedIntervalsFromHotspotLogs(
      [
        {
          time: "2026-09-10 14:27:19",
          topics: "hotspot,account,info,debug",
          message: "mt-active-session-test (10.10.10.200): logged in",
        },
        {
          time: "2026-09-10 14:54:15",
          topics: "hotspot,info,debug",
          message:
            "mt-active-session-test (10.10.10.200): logged out: user request",
        },
      ],
      new Date("2026-09-10T15:00:00Z"),
    );

    expect(intervals).toEqual([
      {
        sessionId: "hotspot:mt-active-session-test:2026-09-10T14:27:19.000Z",
        username: "mt-active-session-test",
        connectedAt: new Date("2026-09-10T14:27:19Z"),
        disconnectedAt: new Date("2026-09-10T14:54:15Z"),
      },
    ]);
  });

  it("ignores login attempts and unrelated log entries", () => {
    const intervals = completedIntervalsFromHotspotLogs(
      [
        {
          time: "2026-09-10 14:27:18",
          topics: "hotspot,info,debug",
          message: "mt-user (10.10.10.201): trying to log in by cookie",
        },
        {
          time: "2026-09-10 14:27:19",
          topics: "system,info",
          message: "mt-user (10.10.10.201): logged in",
        },
      ],
      new Date("2026-09-10T15:00:00Z"),
    );

    expect(intervals).toEqual([]);
  });

  it("pairs events correctly when RouterOS returns them newest first", () => {
    const intervals = completedIntervalsFromHotspotLogs(
      [
        {
          time: "2026-09-10 14:54:15",
          topics: "hotspot,info,debug",
          message:
            "mt-active-session-test (10.10.10.200): logged out: user request",
        },
        {
          time: "2026-09-10 14:27:19",
          topics: "hotspot,account,info,debug",
          message: "mt-active-session-test (10.10.10.200): logged in",
        },
      ],
      new Date("2026-09-10T15:00:00Z"),
    );

    expect(intervals).toHaveLength(1);
    expect(intervals[0]?.disconnectedAt).toEqual(
      new Date("2026-09-10T14:54:15Z"),
    );
  });
});
