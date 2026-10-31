import { Text, View } from "react-native";

import { useTranslation } from "react-i18next";

import type { ActionKind } from "../schemas/action";

type Props = {
  name: string;
  minutes: number;
  kind: ActionKind;
  remindMinutes: number | null;
};

// What happens when the action is used, so it can be checked before saving.
export const UsageFlow = ({ name, minutes, kind, remindMinutes }: Props) => {
  const { t } = useTranslation();
  const shownName = name.trim() || t("create.flow.unnamed");
  const lastStep =
    kind === "after"
      ? t("create.flow.after.rings", { minutes })
      : remindMinutes === null
        ? t("create.flow.before.rings", { minutes })
        : t("create.flow.before.ringsWithReminder", {
            minutes,
            remindMinutes,
          });
  const steps = [
    t("create.flow.press", { name: shownName }),
    kind === "after"
      ? t("create.flow.after.start")
      : t("create.flow.before.enterTarget"),
    lastStep,
  ];

  return (
    <View className="gap-2" aria-label={t("create.flow.title")}>
      <Text role="heading" className="text-ink text-base font-bold">
        {t("create.flow.title")}
      </Text>
      {steps.map((step, index) => (
        <View key={index} className="flex-row gap-3">
          <Text aria-hidden className="text-muted w-3 font-mono text-[15px]">
            {index + 1}
          </Text>
          <Text className="text-ink flex-1 text-[15px]">{step}</Text>
        </View>
      ))}
    </View>
  );
};
