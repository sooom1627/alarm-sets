import { Pressable, Text, View } from "react-native";

import { useTranslation } from "react-i18next";

import { MinusIcon, PlusIcon } from "@/shared/components/icons";

import { actionMaxMinutes, actionMinMinutes } from "../schemas/action";

const PRESETS = [5, 10, 15, 20, 30, 45, 60];

// Below 10 the stepper moves by 1, from 10 up by 5.
const stepUp = (minutes: number) =>
  Math.min(actionMaxMinutes, minutes + (minutes < 10 ? 1 : 5));
const stepDown = (minutes: number) =>
  Math.max(actionMinMinutes, minutes - (minutes <= 10 ? 1 : 5));

type Props = {
  minutes: number;
  onChange: (minutes: number) => void;
};

export const MinutesField = ({ minutes, onChange }: Props) => {
  const { t } = useTranslation();
  const canDecrease = minutes > actionMinMinutes;
  const canIncrease = minutes < actionMaxMinutes;

  return (
    <View className="gap-2">
      <Text className="text-muted font-mono text-xs tracking-wider">
        {t("create.minutes")}
      </Text>
      <View className="bg-card border-continuous flex-row items-center rounded-[22px] py-2 pr-2 pl-5">
        <View
          className="flex-1 flex-row items-baseline gap-1"
          aria-label={t("create.minutes")}
          aria-valuetext={t("create.minutesValue", { minutes })}
        >
          <Text className="text-ink font-mono-light text-4xl">{minutes}</Text>
          <Text className="text-muted text-base">
            {t("create.minutesUnit")}
          </Text>
        </View>
        <Pressable
          role="button"
          aria-label={t("create.decrease")}
          aria-disabled={!canDecrease}
          disabled={!canDecrease}
          onPress={() => onChange(stepDown(minutes))}
          className="size-11 items-center justify-center rounded-full"
        >
          <MinusIcon
            size={20}
            colorClassName={canDecrease ? "accent-ink" : "accent-faint"}
          />
        </Pressable>
        <Pressable
          role="button"
          aria-label={t("create.increase")}
          aria-disabled={!canIncrease}
          disabled={!canIncrease}
          onPress={() => onChange(stepUp(minutes))}
          className="size-11 items-center justify-center rounded-full"
        >
          <PlusIcon
            size={20}
            colorClassName={canIncrease ? "accent-ink" : "accent-faint"}
          />
        </Pressable>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {PRESETS.map((preset) => {
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
                  ? "bg-sun h-11 min-w-11 items-center justify-center rounded-full px-3"
                  : "bg-chip h-11 min-w-11 items-center justify-center rounded-full px-3"
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
  );
};
