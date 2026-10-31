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
  // Measured, so a larger text size that makes the Save bar taller still works.
  const [saveBarHeight, setSaveBarHeight] = useState(96);
  const { back } = useRouter();
  const { mutate: createAction, isPending: isCreating } = useCreateAction();
  // A reminder exists only before a target time, and only when switched on.
  const hasReminder = kind === "before" && isRemindOn;
  // The schema alone decides whether the input can be saved.
  const { success: isValid, data: newAction } = newActionSchema.safeParse({
    name,
    minutes,
    kind,
    remindMinutes: hasReminder ? remindMinutes : null,
  });
  const canSave = isValid && !isCreating;

  // On failure the sheet stays open with what was entered.
  const save = () => {
    if (!newAction) return;
    createAction(newAction, { onSuccess: () => back() });
  };

  const saveButton = (
    <View
      onLayout={(event) => setSaveBarHeight(event.nativeEvent.layout.height)}
      className="bg-screen absolute inset-x-0 bottom-0 px-4 pt-2 pb-8"
    >
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
  );

  return (
    // Save is laid over the bottom of the sheet and the form scrolls under it.
    // The form ends with Save's measured height plus a margin, so the last
    // field can always scroll clear of Save.
    // react-native-screens walks down the first child of a form sheet looking
    // for a ScrollView and resets its frame to the whole sheet (RNSScreen.mm),
    // which hid the form before. The empty first View ends that walk.
    <View className="bg-screen flex-1">
      <View collapsable={false} />
      <ScrollView
        className="flex-1"
        // Starts the fields below the sheet's native header instead of under it.
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-7 px-4 pt-2"
        contentContainerStyle={{ paddingBottom: saveBarHeight + 32 }}
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
      </ScrollView>
      {saveButton}
    </View>
  );
};
