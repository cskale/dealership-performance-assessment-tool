import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import en from '@/i18n/en';

export type Language = 'en' | 'de' | 'fr' | 'es' | 'it';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// UI translations live in src/i18n/<lang>.ts. English is bundled as the fallback;
// other languages are code-split and fetched on demand.
const loaders: Record<Exclude<Language, 'en'>, () => Promise<{ default: Record<string, string> }>> = {
  de: () => import('@/i18n/de'),
  fr: () => import('@/i18n/fr'),
  es: () => import('@/i18n/es'),
  it: () => import('@/i18n/it'),
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Initial: check localStorage first
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'en';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Load language from user profile on auth state change
  useEffect(() => {
    const loadLanguageFromProfile = async (uid: string) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('user_id', uid)
          .maybeSingle();

        if (!error && profile?.preferred_language) {
          const profileLang = profile.preferred_language as Language;
          if (['en', 'de', 'fr', 'es', 'it'].includes(profileLang)) {
            setLanguageState(profileLang);
            localStorage.setItem('app_language', profileLang);
            localStorage.setItem('language', profileLang);
          }
        }
      } catch (err) {
        console.error('Error loading language preference:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
        loadLanguageFromProfile(session.user.id);
      } else {
        setUserId(null);
        setIsLoading(false);
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
        loadLanguageFromProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    localStorage.setItem('language', lang);

    // Save to user profile if logged in
    if (userId) {
      try {
        await supabase
          .from('profiles')
          .update({ preferred_language: lang })
          .eq('user_id', userId);
      } catch (err) {
        console.error('Error saving language preference:', err);
      }
    }
  }, [userId]);

  const [dict, setDict] = useState<Record<string, string>>(en);
  // Hold first paint until the saved language's dictionary arrives, so non-English
  // users never see an English flash. Later switches keep the page mounted.
  const [firstDictReady, setFirstDictReady] = useState(language === 'en');

  useEffect(() => {
    if (language === 'en') { setDict(en); setFirstDictReady(true); return; }
    let cancelled = false;
    loaders[language]()
      .then(m => { if (!cancelled) setDict(m.default); })
      .catch(err => console.error(`Error loading ${language} translations:`, err))
      .finally(() => { if (!cancelled) setFirstDictReady(true); });
    return () => { cancelled = true; };
  }, [language]);

  const t = useCallback((key: string): string => {
    return dict[key] || en[key] || key;
  }, [dict]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {firstDictReady ? children : null}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
