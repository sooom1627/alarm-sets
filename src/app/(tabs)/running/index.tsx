import { Stack, useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { RunningScreen } from "@/features/starts/screens/running-screen";

export default function RunningTab() {
  const { t } = useTranslation();
  const { push } = useRouter();

  return (
    <>
      <RunningScreen />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="gearshape"
          accessibilityLabel={t("settings.title")}
          onPress={() => push("/settings")}
        />
      </Stack.Toolbar>
    </>
  );
}
