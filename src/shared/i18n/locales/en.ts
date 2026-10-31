// English is the source of the translation keys; ja must match its shape.
export const en = {
  tabs: {
    home: "Home",
    running: "Running",
  },
  create: {
    title: "Create",
    sheetTitle: "New action",
    name: "Name",
    namePlaceholder: "e.g. Leave home",
    minutes: "Time",
    minutesValue: "{{minutes}} min",
    whenToRing: "When should it ring?",
    kinds: {
      after: {
        label: "Ring {{minutes}} min after I press",
        example: "e.g. Wake me {{minutes}} min into a nap",
      },
      before: {
        label: "Ring {{minutes}} min before a target time",
        example: "e.g. Remind me {{minutes}} min before leaving home",
      },
    },
    remind: "Reminder",
    remindLead: "Before it rings",
    remindValue: "{{minutes}} min",
    remindDecrease: "Decrease reminder",
    remindIncrease: "Increase reminder",
    save: "Save",
  },
  actionList: {
    kinds: {
      after: {
        tag: "After press",
        unit: "min after",
        spoken: "{{name}}, rings {{minutes}} min after you press",
      },
      before: {
        tag: "Before target",
        unit: "min before",
        spoken: "{{name}}, rings {{minutes}} min before the target time",
      },
    },
    empty: {
      title: "Create your first action",
      body: "Create the things you time, like “Nap” or “Leave home”. Next time, press one here to start it.",
      create: "Create action",
    },
    loadError: {
      title: "Couldn't load your actions",
      retry: "Try again",
    },
  },
  settings: {
    title: "Settings",
    language: "Language",
  },
};

export type Translation = typeof en;
