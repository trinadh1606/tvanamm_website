import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any; needsVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any; rateLimited?: boolean; attemptsRemaining?: number; blockedUntil?: string }>;
  signOut: () => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || ''
          }
        }
      });

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Check if email verification is required
      const needsVerification = !data.session && data.user && !data.user.email_confirmed_at;
      
      if (needsVerification) {
        toast({
          title: "Check Your Email",
          description: "Please check your email and click the verification link to complete your registration.",
          variant: "default",
        });
        return { error: null, needsVerification: true };
      } else {
        toast({
          title: "Welcome to T VANAMM!",
          description: "Account created successfully. You can now log in.",
          variant: "default",
        });
        return { error: null, needsVerification: false };
      }
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check rate limiting before attempting sign in
      const rateLimitResponse = await supabase.functions.invoke('check-rate-limit', {
        body: { email }
      });

      if (rateLimitResponse.error) {
        console.error('Rate limit check failed:', rateLimitResponse.error);
        // Continue with login attempt even if rate limit check fails
      } else if (rateLimitResponse.data && !rateLimitResponse.data.allowed) {
        const blockedUntil = new Date(rateLimitResponse.data.blocked_until);
        const timeRemaining = Math.ceil((blockedUntil.getTime() - new Date().getTime()) / (1000 * 60));
        
        toast({
          title: "Too Many Login Attempts",
          description: `Account temporarily locked. Try again in ${timeRemaining} minutes.`,
          variant: "destructive",
        });
        
        return { 
          error: new Error('Rate limited'), 
          rateLimited: true, 
          attemptsRemaining: 0,
          blockedUntil: rateLimitResponse.data.blocked_until 
        };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Record failed login attempt
        await supabase.functions.invoke('check-rate-limit', {
          body: { email }
        });

        toast({
          title: "Sign In Error", 
          description: error.message,
          variant: "destructive",
        });
        
        return { error, rateLimited: false };
      } else {
        // Reset rate limiting on successful login
        await supabase.functions.invoke('reset-rate-limit');
        
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to T VANAMM",
          variant: "default",
        });
        
        return { error: null, rateLimited: false };
      }
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out",
          variant: "default",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Google Sign In Error",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Google Sign In Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};