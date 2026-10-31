import { Text, View } from "react-native";

import { Host, Picker, Text as SwiftText } from "@expo/ui/swift-ui";
import { pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";

import { useTranslation } from "react-i18next";
import { z } from "zod";

import { actionMaxMinutes, actionMinMinutes } from "../schemas/action";

const minuteOptions = Array.from(
  { length: actionMaxMinutes - actionMinMinutes + 1 },
  (_, index) => actionMinMinutes + index,
);

const minutesSchema = z
  .number()
  .int()
  .min(actionMinMinutes)
  .max(actionMaxMinutes);

type Props = {
  minutes: number;
  onChange: (minutes: number) => void;
};

export const MinutesField = ({ minutes, onChange }: Props) => {
  const { t } = useTranslation();

  return (
    <View className="gap-2">
      <Text className="text-muted font-mono text-xs tracking-wider">
        {t("create.minutes")}
      </Text>
      <View className="bg-card border-continuous rounded-[22px]">
        <Host matchContents={{ vertical: true }}>
          <Picker
            label={t("create.minutes")}
            selection={minutes}
            onSelectionChange={(selection) =>
              onChange(minutesSchema.parse(selection))
            }
            modifiers={[pickerStyle("wheel")]}
          >
            {minuteOptions.map((option) => (
              <SwiftText key={option} modifiers={[tag(option)]}>
                {t("create.minutesValue", { minutes: option })}
              </SwiftText>
            ))}
          </Picker>
        </Host>
      </View>
    </View>
  );
};
