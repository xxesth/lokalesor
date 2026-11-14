"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { onDataReset, startBackgroundJobs } from "@/data";
import { SessionProvider } from "@/features/session";

export function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 10_000, refetchOnWindowFocus: false, retry: false },
          mutations: { retry: false },
        },
      }),
  );

  useEffect(() => {
    startBackgroundJobs();
    // Demo sıfırlanınca tüm ekranlar yeniden yüklensin.
    return onDataReset(() => void qc.invalidateQueries());
  }, [qc]);

  return (
    <QueryClientProvider client={qc}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
}
