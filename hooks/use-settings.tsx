"use client";

import { useState, useEffect, createContext, useContext, useMemo, ReactNode, useCallback } from "react";

export type UpdateSettingsFunction = (newSettings: Partial<Settings>) => void;

export interface Settings {
  apiKey: string;
  baseURL: string;
  model: string;
  language: "zh" | "en";
  theme: "light" | "dark";
  showAllModels: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  baseURL: "https://openrouter.ai/api/v1",
  model: "google/gemma-2-9b-it:free",
  language: "zh",
  theme: "light",
  showAllModels: false,
};

const STORAGE_KEY = "openchat-settings";

interface SettingsContextType {
  settings: Settings;
  updateSettings: UpdateSettingsFunction;
  resetSettings: () => void;
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
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

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    console.log('[useSettings] Updating settings - apiKey:', newSettings.apiKey?.substring(0, 8) + '...', 'baseURL:', newSettings.baseURL);
    setSettings(prevSettings => {
      const updated = { ...prevSettings, ...newSettings };
      console.log('[useSettings] New settings state - apiKey:', updated.apiKey?.substring(0, 8) + '...', 'baseURL:', updated.baseURL);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          console.log('[useSettings] Settings saved to localStorage');
        } catch (error) {
          console.error("Failed to save settings:", error);
        }
      }
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to reset settings:", error);
      }
    }
  }, []);

  const value = useMemo(() => ({
    settings,
    updateSettings,
    resetSettings,
    isLoaded,
  }), [settings, isLoaded, updateSettings, resetSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
