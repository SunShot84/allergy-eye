'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
  allowIpAddress: boolean;
  allowGeolocation: boolean;
  enablePredictiveLearning: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  allowIpAddress: true,
  allowGeolocation: false,
  enablePredictiveLearning: false,
};

const SETTINGS_STORAGE_KEY = 'userSettings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // 初始化时从localStorage加载设置
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  // 更新设置
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
      return updatedSettings;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 