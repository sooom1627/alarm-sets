import i18n from "i18next";

import { initI18n } from "../i18n";

describe("initI18n", () => {
  it("translates in the given language", () => {
    initI18n("ja");
    expect(i18n.t("home.title")).toBe("ホーム");

    initI18n("en");
    expect(i18n.t("home.title")).toBe("Home");
  });

  it("switches the language with changeLanguage", async () => {
    initI18n("ja");

    await i18n.changeLanguage("en");

    expect(i18n.t("home.title")).toBe("Home");
  });
});
