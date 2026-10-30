import { Text, View } from "react-native";

import { useTranslation } from "react-i18next";

import { ClockIcon, PlayIcon } from "@/shared/components/icons";

import { actionKindLabelKeys, type Action } from "../schemas/action";

type Props = {
  action: Action;
};

// Pressing a tile to start the action comes with E-003.
export const ActionTile = ({ action }: Props) => {
  const { t } = useTranslation();
  const { name, minutes, kind } = action;
  const keys = actionKindLabelKeys[kind];
  const KindIcon = kind === "after" ? PlayIcon : ClockIcon;

  return (
    <View
      accessible
      aria-label={t(keys.spoken, { name, minutes })}
      className="bg-card border-continuous flex-1 gap-2 rounded-3xl p-4"
    >
      <View className="flex-row items-center gap-1">
        <KindIcon size={14} colorClassName="accent-muted" />
        <Text className="text-muted font-mono text-xs tracking-wider">
          {t(keys.tag)}
        </Text>
      </View>
      <Text className="text-ink text-[17px] font-bold" numberOfLines={2}>
        {name}
      </Text>
      <View className="flex-row items-baseline gap-1">
        <Text className="text-ink font-mono-light text-5xl">{minutes}</Text>
        <Text className="text-muted text-sm">{t(keys.unit)}</Text>
      </View>
    </View>
  );
};
