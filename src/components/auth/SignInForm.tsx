import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff, Lock, Mail, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onToggleMode: () => void;
}

export const SignInForm = ({ onToggleMode }: SignInFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isBlocked: boolean;
    attemptsRemaining?: number;
    blockedUntil?: string;
  }>({ isBlocked: false });
  
  const { signIn } = useAuth();
  const { toast } = useToast();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const { error, rateLimited, attemptsRemaining, blockedUntil } = await signIn(data.email, data.password);
      
      if (rateLimited) {
        setRateLimitInfo({
          isBlocked: true,
          attemptsRemaining,
          blockedUntil,
        });
        
        const blockedUntilDate = blockedUntil ? new Date(blockedUntil) : null;
        const timeRemaining = blockedUntilDate ? 
          Math.ceil((blockedUntilDate.getTime() - Date.now()) / 1000 / 60) : 30;
        
        toast({
          title: "Too Many Failed Attempts",
          description: `Your IP has been temporarily blocked. Please try again in ${timeRemaining} minutes.`,
          variant: "destructive",
        });
        return;
      }
      
      if (error) {
        // Update attempts remaining if provided
        if (typeof attemptsRemaining === 'number') {
          setRateLimitInfo({
            isBlocked: false,
            attemptsRemaining,
          });
        }
        
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Reset rate limit info on successful login
      setRateLimitInfo({ isBlocked: false });
      
      toast({
        title: "Welcome Back!",
        description: "You have been signed in successfully.",
      });
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatBlockedUntil = (blockedUntil?: string) => {
    if (!blockedUntil) return '';
    const date = new Date(blockedUntil);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.ceil(diffMs / 1000 / 60);
    return diffMins > 0 ? `${diffMins} minutes` : 'shortly';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      {/* Rate Limit Warning */}
      {rateLimitInfo.isBlocked && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Too many failed login attempts. Please try again in {formatBlockedUntil(rateLimitInfo.blockedUntil)}.
          </AlertDescription>
        </Alert>
      )}

      {/* Attempts Remaining Warning */}
      {!rateLimitInfo.isBlocked && typeof rateLimitInfo.attemptsRemaining === 'number' && rateLimitInfo.attemptsRemaining <= 3 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {rateLimitInfo.attemptsRemaining} login attempts remaining before your IP is temporarily blocked.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      {...field} 
                      type="email" 
                      placeholder="Enter your email" 
                      className="pl-10"
                      disabled={rateLimitInfo.isBlocked}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      disabled={rateLimitInfo.isBlocked}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={rateLimitInfo.isBlocked}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={form.formState.isSubmitting || rateLimitInfo.isBlocked}
          >
            {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        Don't have an account?{' '}
        <Button variant="link" onClick={onToggleMode} className="p-0 h-auto font-semibold">
          Sign up
        </Button>
      </div>
    </div>
  );
};