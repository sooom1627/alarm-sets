// AlarmKit is out of process. Jest uses this in place of the native module (a
// root __mocks__ file mocks the node module automatically): alarms are kept in
// memory, so tests read them back with getAlarms() as the app would. Only the
// calls the app makes are here; add one when the app starts using it.
// To deny the permission in a test, spy on requestAuthorization.
type AlarmSchedule = { type: "fixed"; date: number };
type AlarmConfiguration = {
  schedule?: AlarmSchedule;
  presentation: { alert: { title: string } };
};
type Alarm = {
  id: string;
  state: "scheduled";
  title: string;
  schedule: AlarmSchedule | null;
};

const alarms = new Map<string, Alarm>();

export const AlarmKitManager = {
  shared: {
    isSupported: true,
    requestAuthorization: async () => true,
    schedule: async (id: string, configuration: AlarmConfiguration) => {
      const alarm: Alarm = {
        id,
        state: "scheduled",
        title: configuration.presentation.alert.title,
        schedule: configuration.schedule ?? null,
      };
      alarms.set(id, alarm);
      return alarm;
    },
    cancel: async (id: string) => alarms.delete(id),
    getAlarms: async () => [...alarms.values()],
  },
};

export const AlarmConfigurationFactory = {
  alarm: ({
    schedule,
    attributes,
  }: {
    schedule: AlarmSchedule;
    attributes: { presentation: AlarmConfiguration["presentation"] };
  }): AlarmConfiguration => ({
    schedule,
    presentation: attributes.presentation,
  }),
};
