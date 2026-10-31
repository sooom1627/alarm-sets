import { Text, View } from "react-native";

import { Trans, useTranslation } from "react-i18next";

export type StartNoticeContent =
  { kind: "started"; name: string; time: string } | { kind: "failed" };

type Props = {
  notice: StartNoticeContent;
  // The screen's bottom safe area, which takes in the tab bar.
  bottomInset: number;
};

// Shown for a few seconds just above the tab bar after pressing an action.
export const StartNotice = ({ notice, bottomInset }: Props) => {
  const { t } = useTranslation();

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-4"
      style={{ bottom: bottomInset + 12 }}
    >
      <View
        accessible
        aria-label={
          notice.kind === "started"
            ? t("actionList.started.spoken", notice)
            : t("actionList.started.failed")
        }
        className="bg-card border-continuous rounded-2xl px-5 py-4 shadow-lg"
      >
        {notice.kind === "started" ? (
          <Text className="text-ink text-base">
            <Trans
              i18nKey="actionList.started.text"
              values={notice}
              components={{
                name: <Text className="font-bold" />,
                time: <Text className="text-red font-mono" />,
              }}
            />
          </Text>
        ) : (
          <Text className="text-ink text-base">
            {t("actionList.started.failed")}
          </Text>
        )}
      </View>
    </View>
  );
};
