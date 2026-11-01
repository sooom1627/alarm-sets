import type { ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";

import { getDb } from "@/shared/db/db";
import { createQueryClient } from "@/shared/query/query-client";

import { saveLastTarget } from "../../db/last-targets";
import { useLastTarget } from "../use-last-target";

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={createQueryClient()}>
    {children}
  </QueryClientProvider>
);

afterEach(async () => {
  await getDb().execAsync("DELETE FROM last_targets");
});

describe("useLastTarget", () => {
  it("reads the target the action last started with", async () => {
    await saveLastTarget(3, { hour: 8, minute: 0 });

    const { result } = await renderHook(() => useLastTarget(3), { wrapper });

    await waitFor(() =>
      expect(result.current.data).toEqual({ hour: 8, minute: 0 }),
    );
  });

  it("reads null for an action never started", async () => {
    await saveLastTarget(3, { hour: 8, minute: 0 });

    const { result } = await renderHook(() => useLastTarget(4), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});
