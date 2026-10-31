import { z } from "zod";

import { getDb } from "@/shared/db/db";

import { actionSchema, type Action, type NewAction } from "../schemas/action";

let isTableReady = false;

// Each step upgrades the table from the version before it. PRAGMA
// user_version records how far a device's database has come. Only this
// table uses it so far.
const migrations = [
  `CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    minutes INTEGER NOT NULL,
    kind TEXT NOT NULL
  );`,
  "ALTER TABLE actions ADD COLUMN remind_minutes INTEGER;",
];

const getActionsDb = async () => {
  const db = getDb();
  if (isTableReady) return db;
  const { user_version: version } = z
    .object({ user_version: z.number().int() })
    .parse(await db.getFirstAsync("PRAGMA user_version"));
  for (const migration of migrations.slice(version)) {
    await db.execAsync(migration);
  }
  await db.execAsync(`PRAGMA user_version = ${migrations.length}`);
  isTableReady = true;
  return db;
};

// In the order they were made.
export const listActions = async (): Promise<Action[]> => {
  const db = await getActionsDb();
  const rows = await db.getAllAsync(
    "SELECT id, name, minutes, kind, remind_minutes AS remindMinutes FROM actions ORDER BY id",
  );
  return z.array(actionSchema).parse(rows);
};

export const insertAction = async (action: NewAction): Promise<Action> => {
  const db = await getActionsDb();
  const { lastInsertRowId } = await db.runAsync(
    "INSERT INTO actions (name, minutes, kind, remind_minutes) VALUES (?, ?, ?, ?)",
    action.name,
    action.minutes,
    action.kind,
    action.remindMinutes,
  );
  return { id: lastInsertRowId, ...action };
};
