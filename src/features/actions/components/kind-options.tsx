import { Pressable, Text, View } from "react-native";

import { useTranslation } from "react-i18next";

// When the action rings: some minutes after it is pressed, or some minutes
// before a target time asked for when it is pressed.
export type ActionKind = "after" | "before";

const KINDS: ActionKind[] = ["after", "before"];

type Props = {
  kind: ActionKind;
  minutes: number;
  onChange: (kind: ActionKind) => void;
};

export const KindOptions = ({ kind, minutes, onChange }: Props) => {
  const { t } = useTranslation();

  return (
    <View className="gap-2">
      <Text className="text-ink text-base font-bold">
        {t("create.whenToRing")}
      </Text>
      <View role="radiogroup" className="gap-2">
        {KINDS.map((option) => {
          const isChecked = option === kind;
          const label = t(`create.kinds.${option}.label`, { minutes });
          const example = t(`create.kinds.${option}.example`, { minutes });
          return (
            <Pressable
              key={option}
              role="radio"
              aria-label={`${label} ${example}`}
              aria-checked={isChecked}
              onPress={() => onChange(option)}
              className="bg-card border-continuous flex-row items-center gap-3 rounded-[22px] px-4 py-3"
            >
              <View
                className={
                  isChecked
                    ? "border-ink size-6 items-center justify-center rounded-full border-2"
                    : "border-faint size-6 items-center justify-center rounded-full border-2"
                }
              >
                {isChecked && <View className="bg-ink size-3 rounded-full" />}
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-ink text-base font-bold">{label}</Text>
                <Text className="text-muted text-sm">{example}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
