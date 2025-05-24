
'use client';

import { useChangeLocale, useCurrentLocale, useI18n } from '@/lib/i18n/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useTransition, useEffect } from 'react';
import { useLoading } from '@/contexts/loading-context';

export function LanguageSwitcher() {
  const changeLocale = useChangeLocale();
  const currentLocale = useCurrentLocale();
  const t = useI18n();
  const [isPending, startTransition] = useTransition();
  const { setIsLoading } = useLoading();

  const locales = [
    { value: 'en', label: t('languageSwitcher.en') },
    { value: 'zh-CN', label: t('languageSwitcher.zhCN') },
    { value: 'zh-TW', label: t('languageSwitcher.zhTW') },
  ];

  const handleLocaleChange = (newLocale: 'en' | 'zh-CN' | 'zh-TW') => {
    setIsLoading(true);
    startTransition(() => {
      changeLocale(newLocale);
    });
  };

  useEffect(() => {
    if (!isPending) {
      setIsLoading(false);
    }
  }, [isPending, setIsLoading]);

  return (
    <Select
      value={currentLocale}
      onValueChange={handleLocaleChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-auto min-w-[120px] gap-2 border-border hover:bg-accent/50">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <SelectValue placeholder={t('languageSwitcher.placeholder')} />
      </SelectTrigger>
      <SelectContent>
        {locales.map((locale) => (
          <SelectItem key={locale.value} value={locale.value}>
            {locale.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
