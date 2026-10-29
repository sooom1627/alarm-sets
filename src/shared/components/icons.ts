import { Minus, Plus } from "lucide-react-native";
import { withUniwind } from "uniwind";

// Each lucide icon is wrapped once so `colorClassName="accent-*"` sets its
// color from the theme tokens.
export const MinusIcon = withUniwind(Minus);
export const PlusIcon = withUniwind(Plus);
