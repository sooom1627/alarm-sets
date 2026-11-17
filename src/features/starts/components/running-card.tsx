import { Text, View } from "react-native";

import { useTranslation } from "react-i18next";

import type { Action } from "@/features/actions/schemas/action";
import { BellIcon } from "@/shared/components/icons";
import { formatClockTime } from "@/shared/utils/clock-time";

import type { Start } from "../schemas/start";
import { isNextDay } from "../utils/ring-times";
import { barSegments, formatRemaining } from "../utils/running";

type Props = {
  start: Start;
  action: Pick<Action, "name" | "kind" | "minutes">;
  now: number;
};

const segmentClassName = ({
  isFilled,
  isLastMinutes,
}: {
  isFilled: boolean;
  isLastMinutes: boolean;
}) => {
  if (!isFilled) return "bg-line h-3 flex-1 rounded-sm";
  if (isLastMinutes) return "bg-red h-3 flex-1 rounded-sm";
  return "bg-ink h-3 flex-1 rounded-sm";
};

// One start that has not rung yet (docs/screens/running.md). The whole card
// is read as one line; the countdown is not read every second.
export const RunningCard = ({ start, action, now }: Props) => {
  const { t, i18n } = useTranslation();
  const { startedAt, ringsAt, remindsAt } = start;
  const nowDate = new Date(now);
  const formatTime = (epochMs: number) => {
    const time = formatClockTime(epochMs, i18n.language);
    return isNextDay(epochMs, nowDate) ? t("running.tomorrow", { time }) : time;
  };
  // Actions cannot be edited, so the target is the alarm plus its minutes.
  const subtitle =
    action.kind === "after"
      ? t("running.after", { minutes: action.minutes })
      : t("running.target", {
          time: formatTime(ringsAt + action.minutes * 60_000),
        });
  const isReminderPast = remindsAt !== null && remindsAt <= now;

  return (
    <View
      accessible
      aria-label={t("running.spoken", {
        name: action.name,
        time: formatTime(ringsAt),
      })}
      className="bg-card border-continuous gap-3 rounded-[28px] p-5"
    >
      <View className="flex-row items-baseline justify-between gap-2">
        <Text className="text-ink shrink text-[17px] font-bold">
          {action.name}
        </Text>
        <Text className="text-muted font-mono text-[13px]">{subtitle}</Text>
      </View>
      <View>
        <Text className="text-muted font-mono text-xs tracking-wider">
          {t("running.remaining")}
        </Text>
        <Text className="text-ink font-mono-light text-6xl">
          {formatRemaining(ringsAt - now)}
        </Text>
      </View>
      <View className="flex-row gap-0.75" aria-hidden>
        {barSegments(start, now).map((segment, index) => (
          <View key={index} className={segmentClassName(segment)} />
        ))}
      </View>
      <View className="flex-row justify-between" aria-hidden>
        <Text className="text-muted font-mono text-xs">
          {t("running.started", { time: formatTime(startedAt) })}
        </Text>
        <Text className="text-muted font-mono text-xs">
          {formatTime(ringsAt)}
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {remindsAt !== null && (
          <View className="bg-sun-soft flex-row items-center gap-1.5 rounded-full px-3 py-1.5">
            <BellIcon
              size={13}
              colorClassName={isReminderPast ? "accent-muted" : "accent-ink"}
            />
            <Text
              className={
                isReminderPast
                  ? "text-muted font-mono text-[13px] line-through"
                  : "text-ink font-mono text-[13px]"
              }
            >
              {t("running.reminder", { time: formatTime(remindsAt) })}
            </Text>
          </View>
        )}
        <View className="bg-chip flex-row items-center gap-1.5 rounded-full px-3 py-1.5">
          <View className="bg-red size-2 rounded-full" />
          <Text className="text-red font-mono text-[13px]">
            {t("running.rings", { time: formatTime(ringsAt) })}
          </Text>
        </View>
      </View>
    </View>
  );
};
