import { act, fireEvent, screen } from "expo-router/testing-library";

// Tabs, headers and sheets are native views (react-native-screens). These
// helpers find them in the rendered tree and fire the events iOS would send.

type Node = { type: unknown; props: Record<string, unknown> };
type HeaderButton = { accessibilityLabel?: string; buttonId: string };

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
      nativeEvent: {
        selectedScreenKey: tab.props.screenKey as string,
        provenance: 0,
      },
    });
  });
};

const titleOf = (header: Node) => header.props.title as string;

const rightButtonsOf = (header: Node) =>
  (header.props.headerRightBarButtonItems ?? []) as HeaderButton[];

export const headerTitlesInTab = (tabLabel: string) =>
  findTab(tabLabel).queryAll(isShownHeader).map(titleOf);

export const shownHeaderTitles = () =>
  screen.container.queryAll(isShownHeader).map(titleOf);

export const headerButtonLabelsInTab = (tabLabel: string) =>
  findTab(tabLabel)
    .queryAll(isShownHeader)
    .flatMap(rightButtonsOf)
    .map((button) => button.accessibilityLabel);

export const pressHeaderButtonInTab = async (
  tabLabel: string,
  buttonLabel: string,
) => {
  for (const header of findTab(tabLabel).queryAll(isShownHeader)) {
    const button = rightButtonsOf(header).find(
      (item) => item.accessibilityLabel === buttonLabel,
    );
    if (!button) continue;
    await act(async () => {
      fireEvent(header, "pressHeaderBarButtonItem", {
        nativeEvent: { buttonId: button.buttonId },
      });
    });
    return;
  }
  throw new Error(`No header button labelled "${buttonLabel}"`);
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

// A SwiftUI Picker (@expo/ui) renders its options as Text views with a `tag`.
type Modifier = { $type: string; tag?: string | number };

const modifiersOf = (node: Node) => (node.props.modifiers ?? []) as Modifier[];

const findPicker = () => {
  const [picker] = screen.container.queryAll(
    (node) =>
      typeof node.props.onSelectionChange === "function" &&
      "selection" in node.props,
  );
  if (!picker) throw new Error("No picker");
  return picker;
};

const optionsOf = (
  picker: Node & { queryAll: typeof screen.container.queryAll },
) =>
  picker
    .queryAll((node) => modifiersOf(node).some((m) => m.$type === "tag"))
    .map((node) => ({
      label: node.props.text as string,
      tag: modifiersOf(node).find((m) => m.$type === "tag")?.tag,
    }));

export const pickerOptionLabels = () =>
  optionsOf(findPicker()).map((option) => option.label);

export const selectedPickerOptionLabel = () => {
  const picker = findPicker();
  return optionsOf(picker).find(
    (option) => option.tag === picker.props.selection,
  )?.label;
};

export const selectPickerOption = async (label: string) => {
  const picker = findPicker();
  const option = optionsOf(picker).find((item) => item.label === label);
  if (!option) throw new Error(`No picker option labelled "${label}"`);
  await act(async () => {
    fireEvent(picker, "selectionChange", {
      nativeEvent: { selection: option.tag },
    });
  });
};

// A SwiftUI Toggle (@expo/ui) reports a flip with an `isOnChange` event.
const findToggle = () =>
  screen.container.queryAll(
    (node) =>
      typeof node.props.onIsOnChange === "function" && "isOn" in node.props,
  )[0];

export const isToggleShown = () => findToggle() !== undefined;

export const isToggleOn = () => findToggle()?.props.isOn === true;

export const flipToggle = async () => {
  const toggle = findToggle();
  if (!toggle) throw new Error("No toggle");
  await act(async () => {
    fireEvent(toggle, "isOnChange", {
      nativeEvent: { isOn: toggle.props.isOn !== true },
    });
  });
};
