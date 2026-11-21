import { act, renderHook } from "@testing-library/react-native";

import { useNow } from "../use-now";

beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 10, 18, 7, 0, 0) });
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useNow", () => {
  it("starts at the current time", async () => {
    const { result } = await renderHook(() => useNow());

    expect(result.current).toBe(new Date(2026, 10, 18, 7, 0, 0).getTime());
  });

  it("moves on every second", async () => {
    const { result } = await renderHook(() => useNow());

    await act(() => jest.advanceTimersByTime(3000));

    expect(result.current).toBe(new Date(2026, 10, 18, 7, 0, 3).getTime());
  });
});
