"use client";

import { Assistant } from "@/app/assistant";
import { useSettings } from "@/hooks/use-settings";

export default function Home() {
  const { settings, updateSettings, isLoaded } = useSettings();

  return (
    <main className="h-full w-full flex flex-col">
      {isLoaded ? (
        // Avoid remounting Assistant when switching conversations or changing model to prevent state loss.
        // Runtime reinitialization on model change is handled inside Assistant's RuntimeSection.
        <Assistant settings={settings} updateSettings={updateSettings} />
      ) : (
        <div>Loading...</div>
      )}
    </main>
  );
}
