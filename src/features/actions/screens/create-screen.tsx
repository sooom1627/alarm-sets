import { useState } from "react";

import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { KindOptions } from "../components/kind-options";
import { MinutesField } from "../components/minutes-field";
import { RemindField } from "../components/remind-field";
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
  const [isRemindOn, setIsRemindOn] = useState(false);
  const [remindMinutes, setRemindMinutes] = useState(10);
  const { back } = useRouter();
  const { mutate: createAction, isPending: isCreating } = useCreateAction();
  const canSave = name.trim().length > 0 && !isCreating;

  // A reminder exists only before a target time, and only when switched on.
  const hasReminder = kind === "before" && isRemindOn;

  // On failure the sheet stays open with what was entered.
  const save = () =>
    createAction(
      newActionSchema.parse({
        name,
        minutes,
        kind,
        remindMinutes: hasReminder ? remindMinutes : null,
      }),
      { onSuccess: () => back() },
    );

  return (
    // In a form sheet the ScrollView is the screen's root. react-native-screens
    // sizes a root ScrollView to the sheet; a nested one is reset to the sheet's
    // frame (legacy fallback in RNSScreen.mm), which hid the fields on iOS.
    <ScrollView
      className="bg-screen flex-1"
      // Starts the fields below the sheet's native header instead of under it.
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="grow gap-4 px-4 pt-2 pb-8"
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
      {kind === "before" && (
        <RemindField
          isOn={isRemindOn}
          minutes={remindMinutes}
          onIsOnChange={setIsRemindOn}
          onMinutesChange={setRemindMinutes}
        />
      )}
      {/* mt-auto keeps Save at the bottom while the fields are shorter than the sheet. */}
      <View className="mt-auto pt-2">
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
    </ScrollView>
  );
};
