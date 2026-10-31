import { Stack, useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { ActionListScreen } from "@/features/actions/screens/action-list-screen";

export default function HomeTab() {
  const { t } = useTranslation();
  const { push } = useRouter();

  return (
    <>
      <ActionListScreen />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="gearshape"
          accessibilityLabel={t("settings.title")}
          onPress={() => push("/settings")}
        />
        <Stack.Toolbar.Button
          icon="plus"
          accessibilityLabel={t("create.title")}
          onPress={() => push("/create")}
        />
      </Stack.Toolbar>
    </>
  );
}
