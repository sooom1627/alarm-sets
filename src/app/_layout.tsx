import { Stack } from "expo-router";

import { useTranslation } from "react-i18next";

import { initI18n } from "@/shared/i18n/i18n";
import { getInitialLanguage } from "@/shared/i18n/language";

import "../../tailwind.css";

// Synchronous, so the first render already uses the right language.
initI18n(getInitialLanguage());

export default function RootLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings"
        options={{
          presentation: "formSheet",
          sheetGrabberVisible: true,
          title: t("settings.title"),
        }}
      />
    </Stack>
  );
}
