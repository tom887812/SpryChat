"use client";

import { useState, useEffect } from "react";

export type UpdateSettingsFunction = (newSettings: Partial<Settings>) => void;

export interface Settings {
  apiKey: string;
  baseURL: string;
  model: string;
  language: "zh" | "en";
  theme: "light" | "dark";
}

const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  baseURL: "https://api.openai.com/v1",
  model: "gpt-4o",
  language: "zh",
  theme: "light",
};

const STORAGE_KEY = "openchat-settings";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to reset settings:", error);
      }
    }
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoaded,
  };
}
