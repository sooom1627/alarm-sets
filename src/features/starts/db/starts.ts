import { z } from "zod";

import { getDb } from "@/shared/db/db";

import { startSchema, type NewStart, type Start } from "../schemas/start";

let isTableReady = false;

// PRAGMA user_version belongs to the actions table, so this table is only
// created when missing. Add a migration scheme here once a column changes.
const getStartsDb = async () => {
  const db = getDb();
  if (isTableReady) return db;
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS starts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_id INTEGER NOT NULL,
      started_at INTEGER NOT NULL,
      rings_at INTEGER NOT NULL
    );`,
  );
  isTableReady = true;
  return db;
};

// The one that rings first comes first.
export const listStarts = async (): Promise<Start[]> => {
  const db = await getStartsDb();
  const rows = await db.getAllAsync(
    "SELECT id, action_id AS actionId, started_at AS startedAt, rings_at AS ringsAt FROM starts ORDER BY rings_at, id",
  );
  return z.array(startSchema).parse(rows);
};

export const insertStart = async (start: NewStart): Promise<Start> => {
  const db = await getStartsDb();
  const { lastInsertRowId } = await db.runAsync(
    "INSERT INTO starts (action_id, started_at, rings_at) VALUES (?, ?, ?)",
    start.actionId,
    start.startedAt,
    start.ringsAt,
  );
  return { id: lastInsertRowId, ...start };
};
