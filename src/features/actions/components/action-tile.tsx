import { Pressable, Text, View } from "react-native";

import { useTranslation } from "react-i18next";

import { ClockIcon, PlayIcon } from "@/shared/components/icons";

import { actionKindLabelKeys, type Action } from "../schemas/action";

type Props = {
  action: Action;
  // Only "some minutes after it is pressed" starts on a press so far; target
  // time actions get their screen in S-006.
  onPress?: () => void;
};

export const ActionTile = ({ action, onPress }: Props) => {
  const { t } = useTranslation();
  const { name, minutes, kind } = action;
  const keys = actionKindLabelKeys[kind];
  const KindIcon = kind === "after" ? PlayIcon : ClockIcon;

  const label = t(keys.spoken, { name, minutes });
  const content = (
    <>
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
    </>
  );

  if (onPress === undefined) {
    return (
      <View
        accessible
        aria-label={label}
        className="bg-card border-continuous flex-1 gap-2 rounded-3xl p-4"
      >
        {content}
      </View>
    );
  }
  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      className="bg-card border-continuous flex-1 gap-2 rounded-3xl p-4 active:opacity-60"
    >
      {content}
    </Pressable>
  );
};
