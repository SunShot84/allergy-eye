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
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';

export function LanguageSwitcher() {
  const changeLocale = useChangeLocale();
  const currentLocale = useCurrentLocale();
  const t = useI18n();
  const [isPending, startTransition] = useTransition();
  const { setIsLoading } = useLoading();
  const router = useRouter();
  const pathname = usePathname();

  const locales = [
    { value: 'en', label: t('languageSwitcher.en') },
    { value: 'zh-CN', label: t('languageSwitcher.zhCN') },
    { value: 'zh-TW', label: t('languageSwitcher.zhTW') },
  ];

  const handleLocaleChange = async (newLocale: 'en' | 'zh-CN' | 'zh-TW') => {
    setIsLoading(true);
    try {
      // 先更新语言设置
      await changeLocale(newLocale);
      
      // 然后处理路径
      const pathParts = pathname.split('/');
      if (pathParts[1] && locales.some(locale => locale.value === pathParts[1])) {
        pathParts[1] = newLocale;
      } else {
        pathParts.splice(1, 0, newLocale);
      }
      const newPath = pathParts.join('/') || `/${newLocale}`;
      
      // 最后导航到新路径
      router.push(newPath);
    } catch (error) {
      console.error('Error changing locale:', error);
    } finally {
      setIsLoading(false);
    }
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
      <SelectTrigger 
        className={cn(
          "w-auto min-w-[120px] gap-2 border-border",
          "hover:bg-black/5 dark:hover:bg-white/5" // Subtle hover
        )}
      >
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
