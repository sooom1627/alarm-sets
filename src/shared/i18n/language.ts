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
