import { getDb } from "@/shared/db/db";

import { timeOfDaySchema, type TimeOfDay } from "../utils/ring-times";

let isTableReady = false;

// One row per target time action: the target time it last started with, so
// the sheet can offer it again. Created when missing, like starts.
const getLastTargetsDb = async () => {
  const db = getDb();
  if (isTableReady) return db;
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS last_targets (
      action_id INTEGER PRIMARY KEY,
      hour INTEGER NOT NULL,
      minute INTEGER NOT NULL
    );`,
  );
  isTableReady = true;
  return db;
};

export const getLastTarget = async (
  actionId: number,
): Promise<TimeOfDay | null> => {
  const db = await getLastTargetsDb();
  const row = await db.getFirstAsync(
    "SELECT hour, minute FROM last_targets WHERE action_id = ?",
    actionId,
  );
  return timeOfDaySchema.nullable().parse(row ?? null);
};

export const saveLastTarget = async (actionId: number, target: TimeOfDay) => {
  const db = await getLastTargetsDb();
  await db.runAsync(
    "INSERT OR REPLACE INTO last_targets (action_id, hour, minute) VALUES (?, ?, ?)",
    actionId,
    target.hour,
    target.minute,
  );
};
