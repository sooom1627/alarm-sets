import { Stack } from "expo-router";

import { useTranslation } from "react-i18next";

export default function RunningLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: t("tabs.running"), headerLargeTitle: true }}
      />
    </Stack>
  );
}
