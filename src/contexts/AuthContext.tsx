"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfileData {
  knownAllergies: string[];
  // Add other profile fields if your API returns more
}

interface AuthUser {
  id: string;
  username: string;
  profile?: UserProfileData; // Profile is now part of AuthUser
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean; 
  isAuthCheckComplete: boolean; 
  login: (credentials: Record<string, any>) => Promise<void>;
  register: (details: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  fetchAndUpdateUserProfile: (currentToken: string) => Promise<void>; // New function to explicitly refresh profile
}

const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const SESSION_TOKEN_STORAGE_KEY = 'session_token';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const currentLocale = useCurrentLocale();
  const t = useI18n();
  const { toast } = useToast();

  const clearError = () => setError(null);

  const fetchUserProfile = useCallback(async (apiToken: string): Promise<UserProfileData | null> => {
    try {
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${apiToken}` },
      });
      if (response.ok) {
        return await response.json() as UserProfileData;
      } else {
        console.error('Failed to fetch user profile after auth:', response.status, await response.text());
        // Optionally toast a non-critical error here if profile fetch fails but auth was ok
        // toast({ variant: 'warning', title: t('profile.fetchErrorTitle'), description: t('profile.fetchErrorDesc') });
        return null;
      }
    } catch (e) {
      console.error('Error fetching user profile:', e);
      // toast({ variant: 'warning', title: t('profile.fetchErrorTitle'), description: t('profile.fetchErrorDescNetwork') });
      return null;
    }
  }, [t, toast]); // Dependencies for t and toast if used in error messages

  const handleAuthResponse = useCallback(async (response: Response, successCallback?: (data: any) => void) => {
    setIsLoading(false);
    if (response.ok) {
      const data = await response.json(); // This contains { token, user: { id, username } }
      setError(null);
      if (data.token && data.user) {
        localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, data.token);
        setToken(data.token);
        
        // Fetch profile and merge it into the user object
        const userProfileData = await fetchUserProfile(data.token);
        setUser({ 
          id: data.user.id, 
          username: data.user.username, 
          profile: userProfileData || { knownAllergies: [] } // Fallback to empty profile
        });
      }
      if (successCallback) successCallback(data);
      return data; 
    } else {
      const errorData = await response.json();
      const errorMessage = errorData.message || (errorData.errors ? JSON.stringify(errorData.errors) : t('error.unknown'));
      console.error('Auth API Error:', errorMessage, errorData);
      setError(errorMessage);
      toast({ variant: 'destructive', title: t('error.generalTitle'), description: errorMessage });
      throw new Error(errorMessage);
    }
  }, [t, toast, fetchUserProfile]);

  const verifyToken = useCallback(async (currentToken: string) => {
    setIsLoading(true); 
    try {
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: currentToken }),
      });
      if (response.ok) {
        const data = await response.json(); // { user: {id, username}, token (same as currentToken) }
        setToken(currentToken); // Token is still valid
        
        const userProfileData = await fetchUserProfile(currentToken);
        setUser({ 
          id: data.user.id, 
          username: data.user.username, 
          profile: userProfileData || { knownAllergies: [] } // Fallback
        });
        setError(null);
      } else {
        localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
        setUser(null);
        setToken(null);
        if (response.status !== 401) { 
            const errorData = await response.json();
            const message = errorData.message || t('error.unknown');
            setError(message);
        }
      }
    } catch (e: any) {
      console.error('Verify token failed:', e);
      setError(t('error.networkOrServer')); 
      localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
      setIsAuthCheckComplete(true); 
    }
  }, [t, fetchUserProfile]);

  const fetchAndUpdateUserProfile = useCallback(async (currentToken: string) => {
    if (!currentToken) return;
    // This can be called by components if they need to ensure the profile is fresh
    // e.g., after ProfileForm saves, AuthContext itself doesn't need to call this directly usually
    const userProfileData = await fetchUserProfile(currentToken);
    setUser(prevUser => prevUser ? { ...prevUser, profile: userProfileData || { knownAllergies: [] } } : null);
  }, [fetchUserProfile]);


  useEffect(() => {
    const storedToken = localStorage.getItem(SESSION_TOKEN_STORAGE_KEY);
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setIsAuthCheckComplete(true); 
    }
  }, [verifyToken]);

  const login = async (credentials: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      await handleAuthResponse(response, (data) => {
        toast({ title: t('auth.loginSuccessTitle'), description: t('auth.loginSuccessDesc') });
        // router.push(`/${currentLocale}/`); // Redirect handled by login page typically
      });
    } catch (e: any) {
      console.error('Login failed catch block:', e?.message || e);
    }
  };

  const register = async (details: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      await handleAuthResponse(response, (data) => {
        toast({ title: t('auth.registrationSuccessTitle'), description: t('auth.registrationSuccessDescPleaseLogin') });
        // router.push(`/${currentLocale}/login`); // Redirect handled by register page typically
      });
    } catch (e: any) {
      console.error('Registration failed catch block:', e?.message || e);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    const currentToken = localStorage.getItem(SESSION_TOKEN_STORAGE_KEY);

    try {
      if (currentToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`,
          },
        });
      }
    } catch (e: any) {
      console.error('Logout API call failed:', e?.message || e);
      setError(t('error.general')); 
    } finally {
      localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
      // localStorage.removeItem(ALLERGY_PROFILE_STORAGE_KEY); // No longer needed here
      setUser(null);
      setToken(null);
      setIsLoading(false);
      toast({ title: t('auth.logoutSuccessTitle'), description: t('auth.logoutSuccessDesc') });
      // Standard window.location for full reload and state reset on logout, including locale path
      // window.location.href = `/${currentLocale}/login`; 
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token && !!user,
        user,
        token,
        isLoading,
        isAuthCheckComplete, 
        login,
        register,
        logout,
        error,
        clearError,
        fetchAndUpdateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Placeholder for UserProfile.STORAGE_KEY if it's not directly exported or accessible this way.
// This is just for the logout example to clear it. Ideally, constants are managed centrally.
// For now, assuming UserProfile is an object/class that might have a static STORAGE_KEY.
// If UserProfile.STORAGE_KEY is not how it's defined in your actual UserProfile type/logic,
// you would replace 'UserProfile.STORAGE_KEY' in logout with the actual key string for user profile.
// if (typeof UserProfile !== 'function' || !('STORAGE_KEY' in UserProfile)) {
//   // @ts-ignore // Mocking if UserProfile isn't a class with static member
//   UserProfile.STORAGE_KEY = 'allergy_profile';
// } 