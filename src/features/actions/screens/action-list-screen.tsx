import {
  AccessibilityInfo,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import * as Haptics from "expo-haptics";
import { Link, useRouter } from "expo-router";

import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";

import { useStartAction } from "@/features/starts/hooks/use-starts";
import { startAfterPress } from "@/features/starts/schemas/start";
import { formatClockTime } from "@/shared/utils/clock-time";

import { ActionTile } from "../components/action-tile";
import { useActions } from "../hooks/use-actions";
import type { Action } from "../schemas/action";

// Two tiles per row, in the order the actions were made.
const toRows = (actions: Action[]) => {
  const rows: Action[][] = [];
  for (let i = 0; i < actions.length; i += 2) {
    rows.push(actions.slice(i, i + 2));
  }
  return rows;
};

export const ActionListScreen = () => {
  const { t, i18n } = useTranslation();
  const {
    data: actions,
    isError: isActionsError,
    refetch: refetchActions,
  } = useActions();
  const { mutate: startAction } = useStartAction();
  const { push } = useRouter();
  // No confirmation: the press itself starts it (product.md 1.4).
  const start = (action: Action) => {
    const newStart = startAfterPress(action, new Date());
    startAction(newStart, {
      onSuccess: () => {
        const started = t("actionList.started.title", {
          name: action.name,
          time: formatClockTime(newStart.ringsAt, i18n.language),
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success(started);
        AccessibilityInfo.announceForAccessibility(started);
      },
      onError: () => {
        toast.error(t("actionList.started.failed"));
        AccessibilityInfo.announceForAccessibility(
          t("actionList.started.failed"),
        );
      },
    });
  };

  return (
    <ScrollView
      className="bg-grad flex-1"
      contentContainerClassName="gap-3 p-4"
      contentInsetAdjustmentBehavior="automatic"
    >
      {actions === undefined && isActionsError && (
        <View className="bg-card border-continuous items-start gap-3 rounded-[28px] p-5">
          <Text className="text-ink text-[17px] font-bold">
            {t("actionList.loadError.title")}
          </Text>
          <Pressable
            role="button"
            aria-label={t("actionList.loadError.retry")}
            onPress={() => refetchActions()}
            className="bg-chip h-11 justify-center rounded-full px-5"
          >
            <Text className="text-ink text-base">
              {t("actionList.loadError.retry")}
            </Text>
          </Pressable>
        </View>
      )}
      {actions?.length === 0 && (
        <View className="bg-card border-continuous items-start gap-3 rounded-[28px] p-5">
          <Text className="text-ink text-[17px] font-bold">
            {t("actionList.empty.title")}
          </Text>
          <Text className="text-muted text-sm">
            {t("actionList.empty.body")}
          </Text>
          <Link href="/create" asChild>
            <Pressable
              role="button"
              aria-label={t("actionList.empty.create")}
              className="bg-ink h-11 justify-center rounded-full px-5"
            >
              <Text className="text-card text-base font-bold">
                {t("actionList.empty.create")}
              </Text>
            </Pressable>
          </Link>
        </View>
      )}
      {actions !== undefined &&
        toRows(actions).map((row) => (
          <View key={row[0].id} className="flex-row gap-3">
            {row.map((action) => (
              <ActionTile
                key={action.id}
                action={action}
                onPress={() =>
                  action.kind === "after"
                    ? start(action)
                    : push({
                        pathname: "/target-time",
                        params: { actionId: action.id },
                      })
                }
              />
            ))}
            {row.length === 1 && <View className="flex-1" />}
          </View>
        ))}
    </ScrollView>
  );
};
