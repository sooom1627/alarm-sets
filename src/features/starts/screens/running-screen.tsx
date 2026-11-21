import { Pressable, ScrollView, Text, View } from "react-native";

import { Link } from "expo-router";

import { useTranslation } from "react-i18next";

import { useActions } from "@/features/actions/hooks/use-actions";

import { RunningCard } from "../components/running-card";
import { useNow } from "../hooks/use-now";
import { useRunningStarts } from "../hooks/use-starts";

// What has started and not rung yet, the first to ring first. The clock
// moves every second, so each card counts down and leaves once it rings.
export const RunningScreen = () => {
  const { t } = useTranslation();
  const now = useNow();
  const {
    data: runningStarts,
    isError: isStartsError,
    refetch: refetchStarts,
  } = useRunningStarts(now);
  const { data: actions } = useActions();

  return (
    <ScrollView
      className="bg-grad flex-1"
      contentContainerClassName="gap-3 p-4"
      contentInsetAdjustmentBehavior="automatic"
    >
      {runningStarts === undefined && isStartsError && (
        <View className="bg-card border-continuous items-start gap-3 rounded-[28px] p-5">
          <Text className="text-ink text-[17px] font-bold">
            {t("running.loadError.title")}
          </Text>
          <Pressable
            role="button"
            aria-label={t("running.loadError.retry")}
            onPress={() => refetchStarts()}
            className="bg-chip h-11 justify-center rounded-full px-5"
          >
            <Text className="text-ink text-base">
              {t("running.loadError.retry")}
            </Text>
          </Pressable>
        </View>
      )}
      {runningStarts?.length === 0 && (
        <View className="bg-card border-continuous items-start gap-3 rounded-[28px] p-5">
          <Text className="text-ink text-[17px] font-bold">
            {t("running.empty.title")}
          </Text>
          <Text className="text-muted text-sm">{t("running.empty.body")}</Text>
          <Link href="/" asChild>
            <Pressable
              role="button"
              aria-label={t("running.empty.backToList")}
              className="bg-chip h-11 justify-center rounded-full px-5"
            >
              <Text className="text-ink text-base">
                {t("running.empty.backToList")}
              </Text>
            </Pressable>
          </Link>
        </View>
      )}
      {runningStarts?.map((start) => {
        const action = actions?.find(({ id }) => id === start.actionId);
        if (action === undefined) return null;
        return (
          <RunningCard key={start.id} start={start} action={action} now={now} />
        );
      })}
    </ScrollView>
  );
};
