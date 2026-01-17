import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Sparkles, ArrowRight, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function Onboarding() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { wedding, createWedding, loading: weddingLoading } = useWedding();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    partner_name_1: '',
    partner_name_2: '',
    wedding_date: '',
    total_budget: '',
  });

  if (authLoading || weddingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background romantic-gradient">
        <div className="animate-pulse-soft">
          <Heart className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (wedding) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!formData.partner_name_1.trim() || !formData.partner_name_2.trim()) {
        toast.error(t('onboarding.errors.enterBothNames'));
        return;
      }
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const result = await createWedding({
        partner_name_1: formData.partner_name_1.trim(),
        partner_name_2: formData.partner_name_2.trim(),
        wedding_date: formData.wedding_date || undefined,
        total_budget: formData.total_budget ? parseFloat(formData.total_budget) : undefined,
      });

      if (result) {
        toast.success(t('onboarding.success.welcome'));
        navigate('/dashboard');
      } else {
        toast.error(t('auth.errors.somethingWrong'));
      }
    } catch {
      toast.error(t('auth.errors.somethingWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen romantic-gradient flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-rose-light flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-semibold text-foreground mb-3">
            {step === 1 ? t('onboarding.congratulations') : t('onboarding.almostThere')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {step === 1
              ? t('onboarding.startPlanning')
              : t('onboarding.fewMoreDetails')}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-elevated animate-slide-up">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="partner1" className="text-sm font-medium">
                      {t('onboarding.partner1')}
                    </Label>
                    <Input
                      id="partner1"
                      type="text"
                      placeholder={t('onboarding.enterFirstName')}
                      className="h-12 bg-background"
                      value={formData.partner_name_1}
                      onChange={(e) => setFormData({ ...formData, partner_name_1: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partner2" className="text-sm font-medium">
                      {t('onboarding.partner2')}
                    </Label>
                    <Input
                      id="partner2"
                      type="text"
                      placeholder={t('onboarding.enterFirstName')}
                      className="h-12 bg-background"
                      value={formData.partner_name_2}
                      onChange={(e) => setFormData({ ...formData, partner_name_2: e.target.value })}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium">
                      {t('onboarding.weddingDate')} ({t('common.optional')})
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        className="h-12 pl-10 bg-background"
                        value={formData.wedding_date}
                        onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('onboarding.dontWorry')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-sm font-medium">
                      {t('onboarding.estimatedBudget')} ({t('common.optional')})
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="ej. 5000000"
                        className="h-12 pl-8 bg-background"
                        value={formData.total_budget}
                        onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setStep(1)}
                >
                  {t('common.back')}
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1 h-12"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {step === 1 ? t('common.continue') : t('onboarding.startPlanningBtn')}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}