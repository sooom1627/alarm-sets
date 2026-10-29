import { act, fireEvent, screen } from "expo-router/testing-library";

// Tabs, headers and sheets are native views (react-native-screens). These
// helpers find them in the rendered tree and fire the events iOS would send.

type Node = { type: unknown; props: Record<string, any> };

const isShownHeader = (node: Node) =>
  node.type === "RNSScreenStackHeaderConfig" && !node.props.hidden;

const findTab = (tabLabel: string) => {
  const [tab] = screen.container.queryAll(
    (node) => node.type === "RNSTabsScreenIOS" && node.props.title === tabLabel,
  );
  if (!tab) throw new Error(`No tab labelled "${tabLabel}"`);
  return tab;
};

export const pressTab = async (tabLabel: string) => {
  const [host] = screen.container.queryAll(
    (node) => node.type === "RNSTabsHostIOS",
  );
  const tab = findTab(tabLabel);
  await act(async () => {
    fireEvent(host, "tabSelected", {
      nativeEvent: { selectedScreenKey: tab.props.screenKey, provenance: 0 },
    });
  });
};

export const headerTitlesInTab = (tabLabel: string) =>
  findTab(tabLabel)
    .queryAll(isShownHeader)
    .map((header) => header.props.title);

export const shownHeaderTitles = () =>
  screen.container.queryAll(isShownHeader).map((header) => header.props.title);

export const headerButtonLabelsInTab = (tabLabel: string) =>
  findTab(tabLabel)
    .queryAll(isShownHeader)
    .flatMap((header) => header.props.headerRightBarButtonItems ?? [])
    .map((item: { accessibilityLabel?: string }) => item.accessibilityLabel);

export const pressHeaderButtonInTab = async (
  tabLabel: string,
  buttonLabel: string,
) => {
  const header = findTab(tabLabel)
    .queryAll(isShownHeader)
    .find((node) =>
      (node.props.headerRightBarButtonItems ?? []).some(
        (item: { accessibilityLabel?: string }) =>
          item.accessibilityLabel === buttonLabel,
      ),
    );
  if (!header) throw new Error(`No header button labelled "${buttonLabel}"`);
  const item = header.props.headerRightBarButtonItems.find(
    (button: { accessibilityLabel?: string }) =>
      button.accessibilityLabel === buttonLabel,
  );
  await act(async () => {
    fireEvent(header, "pressHeaderBarButtonItem", {
      nativeEvent: { buttonId: item.buttonId },
    });
  });
};

const findSheet = (routeName: string) => {
  const [sheet] = screen.container.queryAll(
    (node) =>
      node.type === "RNSModalScreen" &&
      node.props.stackPresentation === "formSheet" &&
      String(node.props.screenId).startsWith(`${routeName}-`),
  );
  return sheet;
};

export const isSheetShown = (routeName: string) =>
  findSheet(routeName) !== undefined;

// Swiping a sheet down is an iOS gesture; it ends with this event.
export const swipeSheetDown = async (routeName: string) => {
  const sheet = findSheet(routeName);
  if (!sheet) throw new Error(`No sheet for "${routeName}"`);
  await act(async () => {
    fireEvent(sheet, "dismissed", { nativeEvent: { dismissCount: 1 } });
  });
};
