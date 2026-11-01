import { Alert, Linking } from "react-native";

import { randomUUID } from "expo-crypto";

import i18n from "i18next";
import {
  AlarmConfigurationFactory,
  AlarmKitManager,
} from "react-native-ios-alarmkit";

import type { StartAlarms } from "../schemas/start";

const alarmDeniedMessage = "Alarms are not allowed";

// The permission was refused, so nothing could be scheduled.
export const isAlarmDenied = (error: unknown) =>
  error instanceof Error && error.message === alarmDeniedMessage;

// A sheet covers the toasts, so the refusal is a native alert, from which
// the Settings app is one tap away.
export const alertAlarmDenied = () => {
  Alert.alert(i18n.t("alarm.deniedTitle"), i18n.t("alarm.deniedMessage"), [
    { text: i18n.t("alarm.cancel"), style: "cancel" },
    {
      text: i18n.t("alarm.openSettings"),
      onPress: () => void Linking.openSettings(),
    },
  ]);
};

// One AlarmKit alarm on a fixed date. iOS draws the alert, so its colors are
// plain values: the theme tokens do not reach it. Stop is the only button.
const scheduleAlarm = async (title: string, ringsAt: number) => {
  const id = randomUUID();
  await AlarmKitManager.shared.schedule(
    id,
    AlarmConfigurationFactory.alarm({
      schedule: { type: "fixed", date: ringsAt },
      attributes: {
        presentation: {
          alert: {
            title,
            stopButton: {
              text: i18n.t("alarm.stop"),
              textColor: "#FFFFFF",
              systemImageName: "stop.circle",
            },
          },
        },
      },
    }),
  );
  return id;
};

const cancelAlarm = async (id: string | null) => {
  if (id === null) return;
  await AlarmKitManager.shared.cancel(id);
};

export const cancelStartAlarms = async ({
  alarmId,
  remindAlarmId,
}: StartAlarms) => {
  await Promise.all([cancelAlarm(alarmId), cancelAlarm(remindAlarmId)]);
};

// The alarm rings at ringsAt; the reminder, if any, at remindsAt. If the
// reminder fails, the alarm is taken back so a start schedules all or nothing.
export const scheduleStartAlarms = async ({
  name,
  ringsAt,
  remindsAt,
}: {
  name: string;
  ringsAt: number;
  remindsAt: number | null;
}): Promise<StartAlarms> => {
  const isAllowed = await AlarmKitManager.shared.requestAuthorization();
  if (!isAllowed) throw new Error(alarmDeniedMessage);

  const alarmId = await scheduleAlarm(name, ringsAt);
  if (remindsAt === null) return { alarmId, remindAlarmId: null };

  const minutes = Math.round((ringsAt - remindsAt) / 60_000);
  try {
    const remindAlarmId = await scheduleAlarm(
      i18n.t("alarm.reminder", { name, minutes }),
      remindsAt,
    );
    return { alarmId, remindAlarmId };
  } catch (error) {
    await cancelAlarm(alarmId);
    throw error;
  }
};
