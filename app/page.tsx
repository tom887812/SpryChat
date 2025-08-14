"use client";

import { Assistant } from "@/app/assistant";
import { useSettings } from "@/hooks/use-settings";

export default function Home() {
  const { settings, isLoaded, updateSettings } = useSettings();

  return (
    <main className="h-full w-full flex flex-col">
      {isLoaded ? <Assistant key={settings.model} settings={settings} updateSettings={updateSettings} /> : <div>Loading...</div>}
    </main>
  );
}
