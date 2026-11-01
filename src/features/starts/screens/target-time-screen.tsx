import { useEffect, useState } from "react";

import {
  AccessibilityInfo,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { DatePicker, Host } from "@expo/ui/swift-ui";
import { datePickerStyle, labelsHidden } from "@expo/ui/swift-ui/modifiers";

import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";

import { useActions } from "@/features/actions/hooks/use-actions";
import type { Action } from "@/features/actions/schemas/action";
import { formatClockTime } from "@/shared/utils/clock-time";

import { RingTimeRow } from "../components/ring-time-row";
import { useLastTarget } from "../hooks/use-last-target";
import { useStartAtTarget } from "../hooks/use-starts";
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
  // Measured, as in the create sheet, so the list scrolls clear of Start.
  const [startBarHeight, setStartBarHeight] = useState(96);
  const { back } = useRouter();
  const { mutate: startAtTarget, isPending: isStarting } = useStartAtTarget();
  const now = new Date();
  const times = ringTimes({ target, minutes, remindMinutes }, now);
  const formatTime = (epochMs: number) => {
    const time = formatClockTime(epochMs, i18n.language);
    return isNextDay(epochMs, now) ? t("targetTime.tomorrow", { time }) : time;
  };
  const alarmTime = formatTime(times.ringsAt);

  // Same feedback as starting from the list; on failure the sheet stays.
  const start = () => {
    const startedAt = new Date();
    const { ringsAt, remindsAt, isReminderPast } = ringTimes(
      { target, minutes, remindMinutes },
      startedAt,
    );
    startAtTarget(
      {
        start: {
          actionId: action.id,
          startedAt: startedAt.getTime(),
          ringsAt,
          remindsAt: isReminderPast ? null : remindsAt,
        },
        target,
      },
      {
        onSuccess: () => {
          const started = t("actionList.started.title", {
            name,
            time: alarmTime,
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.success(started);
          AccessibilityInfo.announceForAccessibility(started);
          back();
        },
        onError: () => {
          toast.error(t("actionList.started.failed"));
          AccessibilityInfo.announceForAccessibility(
            t("actionList.started.failed"),
          );
        },
      },
    );
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
        contentContainerClassName="gap-6 px-4 pt-2"
        contentContainerStyle={{ paddingBottom: startBarHeight + 32 }}
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
              // The title stays for VoiceOver; shown, it pushes the wheel off the card.
              modifiers={[datePickerStyle("wheel"), labelsHidden()]}
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
      <View
        onLayout={(event) => setStartBarHeight(event.nativeEvent.layout.height)}
        className="bg-screen absolute inset-x-0 bottom-0 px-4 pt-2 pb-8"
      >
        <Pressable
          role="button"
          aria-label={t("targetTime.startAt", { time: alarmTime })}
          aria-disabled={isStarting}
          disabled={isStarting}
          onPress={start}
          className="bg-ink h-14 items-center justify-center rounded-full active:opacity-60"
        >
          <Text className="text-card text-[17px] font-bold">
            {t("targetTime.startAt", { time: alarmTime })}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
