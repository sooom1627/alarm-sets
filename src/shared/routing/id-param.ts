import { useLocalSearchParams } from "expo-router";

import { z } from "zod";

// Ids come in URLs as strings.
export const idParamSchema = z.coerce.number().int().positive();

// null when the param is missing or not an id; the screen then closes as if
// the record were missing.
export function useIdParam(name: string) {
  const params = useLocalSearchParams();
  const parsed = idParamSchema.safeParse(params[name]);
  return parsed.success ? parsed.data : null;
}
