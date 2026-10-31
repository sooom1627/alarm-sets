import { useState } from "react";

import { Stack } from "expo-router";

import { QueryClientProvider } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { initI18n } from "@/shared/i18n/i18n";
import { getInitialLanguage } from "@/shared/i18n/language";
import { createQueryClient } from "@/shared/query/query-client";

import "../../tailwind.css";

// Synchronous, so the first render already uses the right language.
initI18n(getInitialLanguage());

export default function RootLayout() {
  const { t } = useTranslation();
  // One client per mount, so each test that renders the app starts empty.
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="create"
          options={{
            presentation: "formSheet",
            sheetGrabberVisible: true,
            title: t("create.sheetTitle"),
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: "formSheet",
            sheetGrabberVisible: true,
            title: t("settings.title"),
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
