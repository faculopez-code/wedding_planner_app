import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Loader2, Save, Globe } from 'lucide-react';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { wedding, refreshData, loading: weddingLoading } = useWedding();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    partner_name_1: wedding?.partner_name_1 || '',
    partner_name_2: wedding?.partner_name_2 || '',
    wedding_date: wedding?.wedding_date || '',
    venue_name: wedding?.venue_name || '',
    total_budget: wedding?.total_budget?.toString() || '',
  });

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!wedding && !weddingLoading) return <Navigate to="/onboarding" replace />;

  if (wedding && !formData.partner_name_1 && wedding.partner_name_1) {
    setFormData({
      partner_name_1: wedding.partner_name_1,
      partner_name_2: wedding.partner_name_2,
      wedding_date: wedding.wedding_date || '',
      venue_name: wedding.venue_name || '',
      total_budget: wedding.total_budget?.toString() || '',
    });
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wedding) return;

    setSaving(true);
    const { error } = await supabase
      .from('weddings')
      .update({
        partner_name_1: formData.partner_name_1.trim(),
        partner_name_2: formData.partner_name_2.trim(),
        wedding_date: formData.wedding_date || null,
        venue_name: formData.venue_name.trim() || null,
        total_budget: parseFloat(formData.total_budget) || 0,
      })
      .eq('id', wedding.id);

    if (error) {
      toast.error(t('settings.toast.failedSave'));
    } else {
      toast.success(t('settings.toast.saved'));
      refreshData();
    }
    setSaving(false);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-muted p-2">
            <SettingsIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold">{t('settings.title')}</h1>
            <p className="text-muted-foreground">{t('settings.subtitle')}</p>
          </div>
        </div>

        {/* Language Settings */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-display text-xl font-semibold">{t('settings.language')}</h2>
          </div>
          <Select value={i18n.language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t('settings.selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">{t('common.spanish')} 🇦🇷</SelectItem>
              <SelectItem value="en">{t('common.english')} 🇺🇸</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Settings form */}
        <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="partner1">{t('settings.partner1Name')}</Label>
              <Input
                id="partner1"
                value={formData.partner_name_1}
                onChange={(e) => setFormData({ ...formData, partner_name_1: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner2">{t('settings.partner2Name')}</Label>
              <Input
                id="partner2"
                value={formData.partner_name_2}
                onChange={(e) => setFormData({ ...formData, partner_name_2: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">{t('settings.weddingDate')}</Label>
            <Input
              id="date"
              type="date"
              value={formData.wedding_date}
              onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">{t('settings.venueName')}</Label>
            <Input
              id="venue"
              placeholder={t('settings.venuePlaceholder')}
              value={formData.venue_name}
              onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">{t('settings.totalBudget')}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="budget"
                type="number"
                placeholder="ej. 5000000"
                className="pl-7"
                value={formData.total_budget}
                onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t('settings.saveChanges')}
          </Button>
        </form>

        {/* Account info */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold mb-4">{t('settings.account')}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('settings.email')}</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('settings.name')}</span>
              <span>{user?.user_metadata?.full_name || t('settings.notSet')}</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}