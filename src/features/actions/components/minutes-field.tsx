import { Text, View } from "react-native";

import { Host, HStack, Picker, Text as SwiftText } from "@expo/ui/swift-ui";
import { clipped, frame, pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";

import { useTranslation } from "react-i18next";
import { z } from "zod";

import {
  actionKindLabelKeys,
  actionMaxMinutes,
  actionMinMinutes,
  type ActionKind,
} from "../schemas/action";

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
  kind: ActionKind;
  onChange: (minutes: number) => void;
};

export const MinutesField = ({ minutes, kind, onChange }: Props) => {
  const { t } = useTranslation();
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  const keys = actionKindLabelKeys[kind];

  return (
    <View className="gap-2">
      <Text className="text-muted font-mono text-xs tracking-wider">
        {t("create.minutes")}
      </Text>
      {/* The sentence on top reads the wheels as "○ 分後" or "○ 分前". */}
      <View className="bg-card border-continuous gap-1 rounded-[22px] px-3 pt-4 pb-2">
        <View className="gap-0.5 px-2">
          <Text className="text-ink text-base font-bold">
            {t(keys.label, { minutes })}
          </Text>
          <Text className="text-muted text-sm">
            {t(keys.example, { minutes })}
          </Text>
        </View>
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
                  {t(keys.wheelMinutes, { minutes: option })}
                </SwiftText>
              ))}
            </Picker>
          </HStack>
        </Host>
      </View>
    </View>
  );
};
