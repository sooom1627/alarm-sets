import { useEffect, useState } from "react";

import { ScrollView, Text, View } from "react-native";

import { Stack, useRouter } from "expo-router";
import { DatePicker, Host } from "@expo/ui/swift-ui";
import { datePickerStyle } from "@expo/ui/swift-ui/modifiers";

import { useTranslation } from "react-i18next";

import { useActions } from "@/features/actions/hooks/use-actions";
import type { Action } from "@/features/actions/schemas/action";
import { formatClockTime } from "@/shared/utils/clock-time";

import { RingTimeRow } from "../components/ring-time-row";
import { useLastTarget } from "../hooks/use-last-target";
import {
  firstTargetTime,
  isNextDay,
  ringTimes,
  type TimeOfDay,
} from "../utils/ring-times";

type Props = {
  actionId: number | null;
};

// Closes like a missing record when the id is not one of the target time
// actions.
export const TargetTimeScreen = ({ actionId }: Props) => {
  const { data: actions } = useActions();
  const { back } = useRouter();
  const action = actions?.find(
    ({ id, kind }) => id === actionId && kind === "before",
  );
  const isMissing =
    actionId === null || (actions !== undefined && action === undefined);

  useEffect(() => {
    if (isMissing) back();
  }, [isMissing, back]);

  if (action === undefined) return null;
  return <TargetTimeLoader action={action} />;
};

// The form starts from the target the action last started with, so it waits
// for that read. Without one (or if it fails), it starts a little from now.
const TargetTimeLoader = ({ action }: { action: Action }) => {
  const { data: lastTarget, isPending } = useLastTarget(action.id);
  if (isPending) return null;
  return (
    <TargetTimeForm
      action={action}
      initialTarget={lastTarget ?? firstTargetTime(action.minutes, new Date())}
    />
  );
};

type FormProps = {
  action: Action;
  initialTarget: TimeOfDay;
};

const TargetTimeForm = ({ action, initialTarget }: FormProps) => {
  const { t, i18n } = useTranslation();
  const { name, minutes, remindMinutes } = action;
  const [target, setTarget] = useState(initialTarget);
  const now = new Date();
  const times = ringTimes({ target, minutes, remindMinutes }, now);
  const formatTime = (epochMs: number) => {
    const time = formatClockTime(epochMs, i18n.language);
    return isNextDay(epochMs, now) ? t("targetTime.tomorrow", { time }) : time;
  };
  const selection = new Date(now);
  selection.setHours(target.hour, target.minute, 0, 0);

  return (
    <View className="bg-screen flex-1">
      <Stack.Screen options={{ title: name }} />
      {/* Keeps the sheet's frame correction off the scroll view (create.md). */}
      <View collapsable={false} />
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 px-4 pt-2 pb-8"
      >
        <View className="gap-1">
          <Text role="heading" className="text-ink text-xl font-bold">
            {t("targetTime.question")}
          </Text>
          <Text className="text-muted text-sm">
            {t("targetTime.hint", { name, minutes })}
          </Text>
        </View>
        <View className="bg-card border-continuous items-center rounded-3xl p-2">
          <Host matchContents>
            <DatePicker
              title={t("targetTime.pickerLabel")}
              selection={selection}
              displayedComponents={["hourAndMinute"]}
              onDateChange={(date) =>
                setTarget({ hour: date.getHours(), minute: date.getMinutes() })
              }
              modifiers={[datePickerStyle("wheel")]}
            />
          </Host>
        </View>
        <View className="gap-3">
          <Text className="text-ink text-base font-bold">
            {t("targetTime.ringTimes")}
          </Text>
          {times.remindsAt !== null && (
            <RingTimeRow
              time={formatTime(times.remindsAt)}
              label={t("targetTime.reminder")}
              note={
                times.isReminderPast ? t("targetTime.reminderPast") : undefined
              }
            />
          )}
          <RingTimeRow
            time={formatTime(times.ringsAt)}
            label={t("targetTime.alarm")}
            isAlarm
          />
          <RingTimeRow
            time={formatTime(times.targetAt)}
            label={t("targetTime.target")}
            isSilent
          />
        </View>
      </ScrollView>
    </View>
  );
};
