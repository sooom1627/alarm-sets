import { getCalendars } from "expo-localization";

// A time of day such as 14:20 or 2:20 PM, following the device's 12 / 24-hour
// setting (product.md 2.1). Without that setting, the language decides.
export const formatClockTime = (epochMs: number, language: string) => {
  const uses24hourClock = getCalendars()[0].uses24hourClock;
  return new Intl.DateTimeFormat(language, {
    hour: "numeric",
    minute: "2-digit",
    hour12: uses24hourClock === null ? undefined : !uses24hourClock,
  }).format(epochMs);
};
