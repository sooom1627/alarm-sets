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
    hoursLabel: "Hours",
    minutesLabel: "Minutes",
    hoursValue: "{{hours}} hr",
    whenToRing: "When should it ring?",
    kinds: {
      after: {
        label: "Ring {{minutes}} min after I press",
        example: "e.g. Wake me {{minutes}} min into a nap",
        choice: "After I press",
        wheelMinutes: "{{minutes}} min after",
      },
      before: {
        label: "Ring {{minutes}} min before a target time",
        example: "e.g. Remind me {{minutes}} min before leaving home",
        choice: "Before a target",
        wheelMinutes: "{{minutes}} min before",
      },
    },
    remind: "Reminder",
    remindLead: "Before it rings",
    remindValue: "{{minutes}} min",
    remindDecrease: "Decrease reminder",
    remindIncrease: "Increase reminder",
    flow: {
      title: "How it works",
      unnamed: "this action",
      press: "Press “{{name}}” in the list",
      after: {
        start: "It starts right away, with no confirmation",
        rings: "Rings in {{minutes}} min",
      },
      before: {
        enterTarget: "Enter the target time (your last one is filled in)",
        rings: "Rings {{minutes}} min before the target time",
        ringsWithReminder:
          "Rings {{minutes}} min before the target time, with a reminder {{remindMinutes}} min before that",
      },
    },
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
    started: {
      title: "{{name}} rings at {{time}}",
      failed: "Couldn't start",
    },
  },
  settings: {
    title: "Settings",
    language: "Language",
  },
};

export type Translation = typeof en;
