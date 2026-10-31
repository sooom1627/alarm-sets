import { Stack, useRouter } from "expo-router";

import { useTranslation } from "react-i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";

import { ActionListScreen } from "@/features/actions/screens/action-list-screen";

export default function HomeTab() {
  const { t } = useTranslation();
  const { push } = useRouter();

  return (
    <>
      {/* A provider inside the tab reads the tab's own safe area, which takes
          in the tab bar, so bottom toasts sit just above the bar. */}
      <SafeAreaProvider>
        <ActionListScreen />
        <Toaster position="bottom-center" duration={4000} />
      </SafeAreaProvider>
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
