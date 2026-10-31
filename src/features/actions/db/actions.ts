import { z } from "zod";

import { getDb } from "@/shared/db/db";

import { actionSchema, type Action, type NewAction } from "../schemas/action";

let isTableReady = false;

const getActionsDb = async () => {
  const db = getDb();
  if (isTableReady) return db;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      minutes INTEGER NOT NULL,
      kind TEXT NOT NULL
    );
  `);
  isTableReady = true;
  return db;
};

// In the order they were made.
export const listActions = async (): Promise<Action[]> => {
  const db = await getActionsDb();
  const rows = await db.getAllAsync(
    "SELECT id, name, minutes, kind FROM actions ORDER BY id",
  );
  return z.array(actionSchema).parse(rows);
};

export const insertAction = async (action: NewAction): Promise<Action> => {
  const db = await getActionsDb();
  const { lastInsertRowId } = await db.runAsync(
    "INSERT INTO actions (name, minutes, kind) VALUES (?, ?, ?)",
    action.name,
    action.minutes,
    action.kind,
  );
  return { id: lastInsertRowId, ...action };
};
