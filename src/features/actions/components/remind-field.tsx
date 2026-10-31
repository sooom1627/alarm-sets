import { Pressable, Text, View } from "react-native";

import { Host, Toggle } from "@expo/ui/swift-ui";
import { labelsHidden } from "@expo/ui/swift-ui/modifiers";

import { useTranslation } from "react-i18next";

import { MinusIcon, PlusIcon } from "@/shared/components/icons";

import {
  actionMaxRemindMinutes,
  actionMinRemindMinutes,
  actionRemindStep,
} from "../schemas/action";

type Props = {
  isOn: boolean;
  minutes: number;
  onIsOnChange: (isOn: boolean) => void;
  onMinutesChange: (minutes: number) => void;
};

export const RemindField = ({
  isOn,
  minutes,
  onIsOnChange,
  onMinutesChange,
}: Props) => {
  const { t } = useTranslation();
  const canDecrease = minutes > actionMinRemindMinutes;
  const canIncrease = minutes < actionMaxRemindMinutes;

  return (
    <View className="bg-card border-continuous gap-2 rounded-[22px] py-3 pr-3 pl-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-ink text-[17px]">{t("create.remind")}</Text>
        <Host matchContents>
          {/* The visible label is the Text beside it; VoiceOver reads this one. */}
          <Toggle
            label={t("create.remind")}
            isOn={isOn}
            onIsOnChange={onIsOnChange}
            modifiers={[labelsHidden()]}
          />
        </Host>
      </View>
      {isOn && (
        <View className="flex-row items-center">
          <Text className="text-muted flex-1 text-base">
            {t("create.remindLead")}
          </Text>
          <Pressable
            role="button"
            aria-label={t("create.remindDecrease")}
            aria-disabled={!canDecrease}
            disabled={!canDecrease}
            onPress={() => onMinutesChange(minutes - actionRemindStep)}
            className="size-11 items-center justify-center rounded-full"
          >
            <MinusIcon
              size={20}
              colorClassName={canDecrease ? "accent-ink" : "accent-faint"}
            />
          </Pressable>
          <Text
            className="text-ink min-w-20 text-center font-mono text-base"
            aria-label={t("create.remind")}
            aria-valuetext={t("create.remindValue", { minutes })}
          >
            {t("create.remindValue", { minutes })}
          </Text>
          <Pressable
            role="button"
            aria-label={t("create.remindIncrease")}
            aria-disabled={!canIncrease}
            disabled={!canIncrease}
            onPress={() => onMinutesChange(minutes + actionRemindStep)}
            className="size-11 items-center justify-center rounded-full"
          >
            <PlusIcon
              size={20}
              colorClassName={canIncrease ? "accent-ink" : "accent-faint"}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
};
