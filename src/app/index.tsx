import { Text, View } from "react-native";

import { useTranslation } from "react-i18next";

export default function HomeTab() {
  const { t } = useTranslation();

  return (
    <View className="bg-background flex-1 items-center justify-center">
      <Text className="text-foreground">{t("home.title")}</Text>
    </View>
  );
}
