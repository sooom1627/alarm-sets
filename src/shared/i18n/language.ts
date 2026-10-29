import { getLocales } from "expo-localization";
import { Storage } from "expo-sqlite/kv-store";

import { z } from "zod";

export const languageSchema = z.enum(["en", "ja"]);

export type Language = z.infer<typeof languageSchema>;

type DeviceLocale = { languageCode: string | null };

// Device locales come in the user's preferred order (getLocales()).
export const resolveDeviceLanguage = (locales: DeviceLocale[]): Language => {
  for (const { languageCode } of locales) {
    const parsed = languageSchema.safeParse(languageCode);
    if (parsed.success) return parsed.data;
  }
  return "en";
};

const STORAGE_KEY = "language";

// The language chosen in the app wins over the device language.
export const getInitialLanguage = (): Language => {
  const saved = languageSchema.safeParse(Storage.getItemSync(STORAGE_KEY));
  if (saved.success) return saved.data;
  return resolveDeviceLanguage(getLocales());
};

export const saveLanguage = (language: Language) => {
  Storage.setItemSync(STORAGE_KEY, language);
};
