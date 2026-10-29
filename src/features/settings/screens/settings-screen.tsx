import { Text, View } from "react-native";

import { Host, Picker, Text as SwiftText } from "@expo/ui/swift-ui";
import { pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";

import i18n from "i18next";
import { useTranslation } from "react-i18next";

import {
  languageSchema,
  saveLanguage,
  type Language,
} from "@/shared/i18n/language";

const selectLanguage = async (language: Language) => {
  saveLanguage(language);
  await i18n.changeLanguage(language);
};

export const SettingsScreen = () => {
  const { t, i18n: currentI18n } = useTranslation();
  const currentLanguage = languageSchema.parse(currentI18n.resolvedLanguage);

  return (
    <View className="bg-screen flex-1 gap-2 p-4">
      <Text className="text-muted text-sm">{t("settings.language")}</Text>
      <Host matchContents={{ vertical: true }}>
        <Picker
          label={t("settings.language")}
          selection={currentLanguage}
          onSelectionChange={(language) =>
            selectLanguage(languageSchema.parse(language))
          }
          modifiers={[pickerStyle("segmented")]}
        >
          {/* Each language is named in its own language and never translated. */}
          <SwiftText modifiers={[tag("en")]}>English</SwiftText>
          <SwiftText modifiers={[tag("ja")]}>日本語</SwiftText>
        </Picker>
      </Host>
    </View>
  );
};
