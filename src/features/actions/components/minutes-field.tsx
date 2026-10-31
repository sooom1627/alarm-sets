import { Pressable, Text, View } from "react-native";

import { Host, HStack, Picker, Text as SwiftText } from "@expo/ui/swift-ui";
import { clipped, frame, pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";

import { useTranslation } from "react-i18next";
import { z } from "zod";

import { actionMaxMinutes, actionMinMinutes } from "../schemas/action";

const presets = [5, 10, 15, 20, 30, 45, 60];

// Two wheels like the iOS timer: hours 0–4 and minutes 0–59.
const hourOptions = Array.from(
  { length: Math.floor(actionMaxMinutes / 60) + 1 },
  (_, index) => index,
);
const minuteOptions = Array.from({ length: 60 }, (_, index) => index);

// About five rows of each wheel; the default is 216pt.
const wheelHeight = 160;

const wheelValueSchema = z.number().int().min(0);

// 0 h 0 min becomes 1 min and 4 h 30 min becomes 4 h, so the total stays in 1–240.
const toTotalMinutes = (hours: number, minutes: number) =>
  Math.min(actionMaxMinutes, Math.max(actionMinMinutes, hours * 60 + minutes));

type Props = {
  minutes: number;
  onChange: (minutes: number) => void;
};

export const MinutesField = ({ minutes, onChange }: Props) => {
  const { t } = useTranslation();
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  return (
    <View className="gap-2">
      <Text className="text-muted font-mono text-xs tracking-wider">
        {t("create.minutes")}
      </Text>
      {/* The wheel and its shortcut chips form one control, so they share a card. */}
      <View className="bg-card border-continuous gap-2 rounded-[22px] px-3 pt-1 pb-3">
        <Host matchContents={{ vertical: true }}>
          <HStack spacing={0}>
            <Picker
              label={t("create.hoursLabel")}
              selection={hours}
              onSelectionChange={(selection) =>
                onChange(
                  toTotalMinutes(
                    wheelValueSchema.parse(selection),
                    restMinutes,
                  ),
                )
              }
              modifiers={[
                pickerStyle("wheel"),
                frame({ height: wheelHeight }),
                clipped(),
              ]}
            >
              {hourOptions.map((option) => (
                <SwiftText key={option} modifiers={[tag(option)]}>
                  {t("create.hoursValue", { hours: option })}
                </SwiftText>
              ))}
            </Picker>
            <Picker
              label={t("create.minutesLabel")}
              selection={restMinutes}
              onSelectionChange={(selection) =>
                onChange(
                  toTotalMinutes(hours, wheelValueSchema.parse(selection)),
                )
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
          </HStack>
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
