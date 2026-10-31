import { Pressable, Text, View } from "react-native";

import { useTranslation } from "react-i18next";

import {
  actionKindLabelKeys,
  actionKindSchema,
  type ActionKind,
} from "../schemas/action";

type Props = {
  kind: ActionKind;
  onChange: (kind: ActionKind) => void;
};

// Chosen before the time, so the time below reads as "○ 分後" or "○ 分前".
export const KindOptions = ({ kind, onChange }: Props) => {
  const { t } = useTranslation();

  return (
    <View className="gap-2">
      <Text className="text-ink text-base font-bold">
        {t("create.whenToRing")}
      </Text>
      <View role="radiogroup" className="bg-chip flex-row rounded-full p-1">
        {actionKindSchema.options.map((option) => {
          const isChecked = option === kind;
          const choice = t(actionKindLabelKeys[option].choice);
          return (
            <Pressable
              key={option}
              role="radio"
              aria-label={choice}
              aria-checked={isChecked}
              onPress={() => onChange(option)}
              className={
                isChecked
                  ? "bg-card h-10 flex-1 items-center justify-center rounded-full"
                  : "h-10 flex-1 items-center justify-center rounded-full"
              }
            >
              <Text
                className={
                  isChecked
                    ? "text-ink text-[15px] font-bold"
                    : "text-muted text-[15px]"
                }
              >
                {choice}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
