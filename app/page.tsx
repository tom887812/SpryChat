"use client";

import { Assistant } from "@/app/assistant";
import { useSettings } from "@/hooks/use-settings";

export default function Home() {
  const { settings, updateSettings, isLoaded } = useSettings();

  return (
    <main className="h-full w-full flex flex-col">
      {isLoaded ? (
        // Avoid remounting Assistant when switching conversations to prevent losing history.
        // Keep model in the key so runtime can reinitialize when model changes.
        <Assistant key={`${settings.model}`} settings={settings} updateSettings={updateSettings} />
      ) : (
        <div>Loading...</div>
      )}
    </main>
  );
}
