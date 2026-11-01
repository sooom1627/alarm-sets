import { Text, View } from "react-native";

type Props = {
  time: string;
  label: string;
  // The alarm itself; its time is red.
  isAlarm?: boolean;
  // The target time does not ring: an open circle.
  isSilent?: boolean;
  // A reminder that has passed: struck through, with why.
  note?: string;
};

export const RingTimeRow = ({
  time,
  label,
  isAlarm,
  isSilent,
  note,
}: Props) => (
  <View accessible aria-label={[time, label, note].filter(Boolean).join(" ")}>
    <View className="flex-row items-center gap-3">
      <View
        className={
          isSilent
            ? "border-muted size-2.5 rounded-full border"
            : isAlarm
              ? "bg-red size-2.5 rounded-full"
              : "bg-ink size-2.5 rounded-full"
        }
      />
      <Text
        className={
          isAlarm
            ? "text-red font-mono text-xl"
            : note
              ? "text-muted font-mono text-xl line-through"
              : "text-ink font-mono text-xl"
        }
      >
        {time}
      </Text>
      <Text
        className={
          note ? "text-muted text-sm line-through" : "text-muted text-sm"
        }
      >
        {label}
      </Text>
    </View>
    {note && <Text className="text-muted pl-5.5 text-xs">{note}</Text>}
  </View>
);
