import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { dateRange, fillDailySeries } from "../creator/range";

describe("dateRange", () => {
  test("last N days, inclusive of today, as YYYY-MM-DD (UTC)", () => {
    const now = new Date("2026-11-14T15:00:00Z");
    assert.deepEqual(dateRange(7, now), {
      from: "2026-11-08",
      to: "2026-11-14"
    });
    assert.deepEqual(dateRange(1, now), {
      from: "2026-11-14",
      to: "2026-11-14"
    });
  });
});

describe("fillDailySeries", () => {
  test("adds zero days so the chart has one bar per day", () => {
    const out = fillDailySeries(
      [{ date: "2026-11-02", units: 2, gross: "10.0", earned: "7.0" }],
      "2026-11-01",
      "2026-11-03"
    );
    assert.deepEqual(out, [
      { date: "2026-11-01", units: 0, gross: 0, earned: 0 },
      { date: "2026-11-02", units: 2, gross: 10, earned: 7 },
      { date: "2026-11-03", units: 0, gross: 0, earned: 0 }
    ]);
  });

  test("ignores rows outside the range and keeps the last 400 days", () => {
    const out = fillDailySeries(
      [{ date: "2019-06-01", units: 9, gross: 1, earned: 1 }],
      "2020-01-01",
      "2026-01-01"
    );
    assert.equal(out.length, 400);
    assert.equal(
      out.every((p) => p.units === 0),
      true
    );
  });
});
