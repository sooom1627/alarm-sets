import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";

let db: SQLiteDatabase | undefined;

// One connection for the app. Tables are created by each feature's db/.
export const getDb = () => {
  db ??= openDatabaseSync("alarm-sets.db");
  return db;
};
