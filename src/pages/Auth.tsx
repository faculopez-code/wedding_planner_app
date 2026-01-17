import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

export default function Auth() {
  const { t } = useTranslation();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginSchema = z.object({
    email: z.string().email(t('auth.errors.invalidEmail')),
    password: z.string().min(6, t('auth.errors.passwordMin')),
  });

  const signupSchema = loginSchema.extend({
    fullName: z.string().min(2, t('auth.errors.enterName')),
  });

  if (user && !authLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const schema = isLogin ? loginSchema : signupSchema;
      const result = schema.safeParse(formData);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(error.message || t('auth.errors.failedSignIn'));
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error(t('auth.errors.alreadyRegistered'));
          } else {
            toast.error(error.message || t('auth.errors.failedCreateAccount'));
          }
        } else {
          toast.success(t('auth.success.accountCreated'));
        }
      }
    } catch {
      toast.error(t('auth.errors.somethingWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen romantic-gradient flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-foreground">
          <Heart className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-semibold">{t('nav.weddingPlanner')}</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8 shadow-elevated animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-rose-light flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-semibold text-foreground">
                {isLogin ? t('auth.welcomeBack') : t('auth.beginJourney')}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isLogin
                  ? t('auth.signInContinue')
                  : t('auth.createAccountStart')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    {t('auth.yourName')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={t('auth.enterName')}
                      className="pl-10 h-12 bg-background"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t('auth.email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10 h-12 bg-background"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t('auth.password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-12 bg-background"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? t('auth.signIn') : t('auth.createAccount')}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin ? (
                  <>
                    {t('auth.noAccount')}{' '}
                    <span className="text-primary font-medium">{t('auth.signUp')}</span>
                  </>
                ) : (
                  <>
                    {t('auth.hasAccount')}{' '}
                    <span className="text-primary font-medium">{t('auth.signIn')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}