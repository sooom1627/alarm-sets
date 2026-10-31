import { Text, View } from "react-native";

import { Trans, useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-screens/experimental";
import { withUniwind } from "uniwind";

const StyledSafeAreaView = withUniwind(SafeAreaView);

export type StartNoticeContent =
  { kind: "started"; name: string; time: string } | { kind: "failed" };

type Props = {
  notice: StartNoticeContent;
};

// Shown for a few seconds above the tab bar after pressing an action. The
// native safe area view keeps it clear of the tab bar, which the screen's
// content runs under on iOS.
export const StartNotice = ({ notice }: Props) => {
  const { t } = useTranslation();

  return (
    <StyledSafeAreaView
      edges={{ bottom: true }}
      pointerEvents="box-none"
      className="absolute inset-0 justify-end px-4 pb-3"
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
    </StyledSafeAreaView>
  );
};
