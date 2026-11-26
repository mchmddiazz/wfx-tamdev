import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  activeThemeName: Theme;
  themeDraft: any;
  saveDraft: (draft: any) => Promise<void>;
  publishTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return isTheme(savedTheme) ? savedTheme : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const activeThemeName = theme;
  const [themeDraft, setThemeDraft] = useState<any>(null);

  const saveDraft = async (draft: any) => {
    setThemeDraft(draft);
    await supabase.from('site_theme_drafts').upsert({ name: activeThemeName, draft });
  };

  const publishTheme = async () => {
    if (!themeDraft) return;
    await supabase.from('site_themes').upsert({ name: activeThemeName, theme: themeDraft });
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, activeThemeName, themeDraft, saveDraft, publishTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
