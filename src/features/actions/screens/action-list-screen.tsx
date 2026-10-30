import { Pressable, ScrollView, Text, View } from "react-native";

import { Link } from "expo-router";

import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const {
    data: actions,
    isError: isActionsError,
    refetch: refetchActions,
  } = useActions();

  return (
    <ScrollView
      className="bg-screen flex-1"
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
              <ActionTile key={action.id} action={action} />
            ))}
            {row.length === 1 && <View className="flex-1" />}
          </View>
        ))}
    </ScrollView>
  );
};
