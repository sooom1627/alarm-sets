import { TargetTimeScreen } from "@/features/starts/screens/target-time-screen";
import { useIdParam } from "@/shared/routing/id-param";

export default function TargetTimeSheet() {
  const actionId = useIdParam("actionId");
  return <TargetTimeScreen actionId={actionId} />;
}
