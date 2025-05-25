"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function RegisterForm() {
  const t = useI18n();
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (password !== confirmPassword) {
      setError(t('error.passwordsDoNotMatch'));
      return;
    }

    try {
      await register({ username, password } /*, captcha */);
      // Success toast is handled in AuthContext or by the register function itself.
      // Potentially redirect to login page or show a message to check email for verification if implemented.
      router.push('/login'); 
    } catch (err: any) {
      setError(err.message || t('auth.registrationFailed'));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{t('auth.registerTitle')}</CardTitle>
        <CardDescription>{t('auth.alreadyHaveAccount')} <Link href="/login" className="font-medium text-primary hover:underline">{t('auth.signInLink')}</Link></CardDescription>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('auth.confirmPasswordLabel')}</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder={t('auth.confirmPasswordPlaceholder')} 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              disabled={isLoading}
            />
          </div>
          {/* Future Captcha Input */}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? t('auth.registering') : t('auth.registerButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 