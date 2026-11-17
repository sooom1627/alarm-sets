import { Bell, Clock, Minus, Play, Plus } from "lucide-react-native";
import { withUniwind } from "uniwind";

// Each lucide icon is wrapped once so `colorClassName="accent-*"` sets its
// color from the theme tokens.
export const BellIcon = withUniwind(Bell);
export const ClockIcon = withUniwind(Clock);
export const MinusIcon = withUniwind(Minus);
export const PlayIcon = withUniwind(Play);
export const PlusIcon = withUniwind(Plus);
