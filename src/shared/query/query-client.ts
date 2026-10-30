import { QueryClient } from "@tanstack/react-query";

// Data lives on the device and only this app writes it, so it never goes
// stale on its own: writes invalidate the queries they change. A failed local
// read is not fixed by trying again.
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
