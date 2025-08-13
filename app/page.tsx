"use client";

import { Assistant } from "./assistant";
import { ClientOnly } from "@/components/client-only";

export default function Home() {
  return (
    <ClientOnly fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">SpryChat 加载中...</div>
      </div>
    }>
      <Assistant />
    </ClientOnly>
  );
}
