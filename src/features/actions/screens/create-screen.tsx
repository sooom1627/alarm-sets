import { useState } from "react";

import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { KindOptions } from "../components/kind-options";
import { MinutesField } from "../components/minutes-field";
import { useCreateAction } from "../hooks/use-actions";
import {
  actionNameMaxLength,
  newActionSchema,
  type ActionKind,
} from "../schemas/action";

export const CreateScreen = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [kind, setKind] = useState<ActionKind>("after");
  const { back } = useRouter();
  const { mutate: createAction, isPending: isCreating } = useCreateAction();
  const canSave = name.trim().length > 0 && !isCreating;

  // On failure the sheet stays open with what was entered.
  const save = () =>
    createAction(
      newActionSchema.parse({ name, minutes, kind, remindMinutes: null }),
      {
        onSuccess: () => back(),
      },
    );

  return (
    <View className="bg-screen flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 p-4"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-2">
          <Text className="text-muted font-mono text-xs tracking-wider">
            {t("create.name")}
          </Text>
          <TextInput
            aria-label={t("create.name")}
            value={name}
            onChangeText={setName}
            maxLength={actionNameMaxLength}
            placeholder={t("create.namePlaceholder")}
            placeholderTextColorClassName="accent-faint"
            className="bg-card text-ink border-continuous h-14 rounded-[22px] px-5 text-[17px]"
          />
        </View>
        <MinutesField minutes={minutes} onChange={setMinutes} />
        <KindOptions kind={kind} minutes={minutes} onChange={setKind} />
      </ScrollView>
      <View className="px-4 pt-2 pb-8">
        <Pressable
          role="button"
          aria-label={t("create.save")}
          aria-disabled={!canSave}
          disabled={!canSave}
          onPress={save}
          className={
            canSave
              ? "bg-ink h-14 items-center justify-center rounded-full"
              : "bg-chip h-14 items-center justify-center rounded-full"
          }
        >
          <Text
            className={
              canSave
                ? "text-card text-[17px] font-bold"
                : "text-muted text-[17px] font-bold"
            }
          >
            {t("create.save")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
