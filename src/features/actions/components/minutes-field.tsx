import { Pressable, Text, View } from "react-native";

import { Host, Picker, Text as SwiftText } from "@expo/ui/swift-ui";
import { clipped, frame, pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";

import { useTranslation } from "react-i18next";
import { z } from "zod";

import { actionMaxMinutes, actionMinMinutes } from "../schemas/action";

const presets = [5, 10, 15, 20, 30, 45, 60];

const minuteOptions = Array.from(
  { length: actionMaxMinutes - actionMinMinutes + 1 },
  (_, index) => actionMinMinutes + index,
);

// About five rows of the wheel; the default is 216pt.
const wheelHeight = 160;

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
      {/* The wheel and its shortcut chips form one control, so they share a card. */}
      <View className="bg-card border-continuous gap-2 rounded-[22px] px-3 pt-1 pb-3">
        <Host matchContents={{ vertical: true }}>
          <Picker
            label={t("create.minutes")}
            selection={minutes}
            onSelectionChange={(selection) =>
              onChange(minutesSchema.parse(selection))
            }
            modifiers={[
              pickerStyle("wheel"),
              frame({ height: wheelHeight }),
              clipped(),
            ]}
          >
            {minuteOptions.map((option) => (
              <SwiftText key={option} modifiers={[tag(option)]}>
                {t("create.minutesValue", { minutes: option })}
              </SwiftText>
            ))}
          </Picker>
        </Host>
        <View className="border-line flex-row justify-between border-t pt-3">
          {presets.map((preset) => {
            const isSelected = preset === minutes;
            return (
              <Pressable
                key={preset}
                role="button"
                aria-label={String(preset)}
                aria-selected={isSelected}
                onPress={() => onChange(preset)}
                className={
                  isSelected
                    ? "bg-sun h-10 min-w-11 items-center justify-center rounded-full px-2"
                    : "bg-chip h-10 min-w-11 items-center justify-center rounded-full px-2"
                }
              >
                <Text
                  className={
                    isSelected
                      ? "text-on-sun font-mono text-sm"
                      : "text-ink font-mono text-sm"
                  }
                >
                  {preset}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};
