import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Globe } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import i18n from '@/lib/i18n';

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language | string; label: string; flag: string; active: boolean }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧', active: true },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪', active: true },
    { code: 'fr', label: 'Français', flag: '🇫🇷', active: false },
    { code: 'es', label: 'Español', flag: '🇪🇸', active: false },
    { code: 'it', label: 'Italiano', flag: '🇮🇹', active: false },
  ];

  const handleLanguageChange = (langCode: string) => {
    if (langCode === 'en' || langCode === 'de') {
      setLanguage(langCode as Language);
      i18n.changeLanguage(langCode);
      localStorage.setItem('language', langCode);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{language === 'en' ? '🇬🇧 EN' : '🇩🇪 DE'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border z-50">
        {languages.map((lang) => {
          if (lang.active) {
            return (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`cursor-pointer ${language === lang.code ? 'bg-muted' : ''}`}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.label}
              </DropdownMenuItem>
            );
          }

          return (
            <Tooltip key={lang.code}>
              <TooltipTrigger asChild>
                <div className="relative flex cursor-not-allowed select-none items-center rounded-sm px-2 py-1.5 text-sm opacity-50">
                  <span className="mr-2">{lang.flag}</span>
                  {lang.label}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                Full translation coming soon
              </TooltipContent>
            </Tooltip>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
