import { View } from "react-native";

import { Stack, useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

export default function HomeTab() {
  const { t } = useTranslation();
  const { push } = useRouter();

  return (
    <>
      <View className="bg-screen flex-1" />
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
