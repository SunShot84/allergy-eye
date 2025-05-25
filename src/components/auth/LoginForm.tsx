"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useI18n, useCurrentLocale } from '@/lib/i18n/client';
import { useRouter } from 'next/navigation'; // Using next/navigation for App Router
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  redirectTo?: string | null;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const t = useI18n();
  const router = useRouter();
  const currentLocale = useCurrentLocale();
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  // const [captcha, setCaptcha] = useState(''); // For future captcha

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username) {
      setError(t('error.usernameRequired'));
      return;
    }
    if (!password) {
      setError(t('error.passwordRequired'));
      return;
    }

    try {
      await login({ username, password } /*, captcha */);
      // Login success toast is handled in AuthContext
      // 如果有redirect参数，跳转到指定URL，否则跳转到首页
      const targetPath = redirectTo || `/${currentLocale}`;
      router.push(targetPath);
    } catch (err: any) {
      setError(err.message || t('error.loginFailed'));
    }
  };

  // 创建注册链接，保持redirect参数
  const registerHref = redirectTo 
    ? `/register?redirect=${encodeURIComponent(redirectTo)}` 
    : '/register';

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{t('auth.loginTitle')}</CardTitle>
        <CardDescription>{t('auth.dontHaveAccount')} <Link href={registerHref} className="font-medium text-primary hover:underline">{t('auth.signUpLink')}</Link></CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t('auth.usernameLabel')}</Label>
            <Input 
              id="username" 
              type="text" 
              placeholder={t('auth.usernamePlaceholder')} 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.passwordLabel')}</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder={t('auth.passwordPlaceholder')} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={isLoading}
            />
          </div>
          {/* Future Captcha Input */} 
          {/* <div className="space-y-2">
            <Label htmlFor="captcha">{t('auth.captchaPlaceholder')}</Label>
            <Input id="captcha" type="text" value={captcha} onChange={(e) => setCaptcha(e.target.value)} />
            <p className="text-sm text-muted-foreground">{t('auth.captchaInstruction')}</p>
          </div> */}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? t('auth.loggingIn') : t('auth.loginButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 