// SQLite is out of process. Jest uses this in place of expo-sqlite (a root
// __mocks__ file mocks the node module automatically): the same calls run on
// Node's built-in SQLite, in memory, so the real SQL is exercised. Only the
// calls the app makes are here; add one when the app starts using it.
import { DatabaseSync } from "node:sqlite";

type BindValue = string | number | null;

// expo-sqlite takes the values as one array or one by one.
const toArgs = (params: (BindValue | BindValue[])[]) =>
  params.flat() as BindValue[];

export const openDatabaseSync = () => {
  const db = new DatabaseSync(":memory:");
  return {
    execAsync: async (source: string) => db.exec(source),
    runAsync: async (
      source: string,
      ...params: (BindValue | BindValue[])[]
    ) => {
      const { lastInsertRowid, changes } = db
        .prepare(source)
        .run(...toArgs(params));
      return {
        lastInsertRowId: Number(lastInsertRowid),
        changes: Number(changes),
      };
    },
    getAllAsync: async (
      source: string,
      ...params: (BindValue | BindValue[])[]
    ) => db.prepare(source).all(...toArgs(params)),
  };
};
