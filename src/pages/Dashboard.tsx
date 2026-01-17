import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { CountdownTimer } from '@/components/wedding/CountdownTimer';
import { BudgetOverview } from '@/components/wedding/BudgetOverview';
import { TasksPreview } from '@/components/wedding/TasksPreview';
import { GuestsPreview } from '@/components/wedding/GuestsPreview';
import { ProgressOverview } from '@/components/wedding/ProgressOverview';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Calendar, MapPin } from 'lucide-react';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { wedding, loading: weddingLoading } = useWedding();

  const dateLocale = i18n.language === 'es' ? es : enUS;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft">
          <div className="w-12 h-12 rounded-full bg-primary/20" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!wedding && !weddingLoading) {
    return <Navigate to="/onboarding" replace />;
  }

  if (weddingLoading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-3">
            {wedding?.partner_name_1} & {wedding?.partner_name_2}
          </h1>
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            {wedding?.wedding_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(parseISO(wedding.wedding_date), 'd MMMM yyyy', { locale: dateLocale })}</span>
              </div>
            )}
            {wedding?.venue_name && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{wedding.venue_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Countdown */}
        {wedding?.wedding_date && (
          <CountdownTimer weddingDate={wedding.wedding_date} />
        )}

        {/* Dashboard widgets grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TasksPreview />
          </div>
          <div>
            <BudgetOverview />
          </div>
          <div>
            <GuestsPreview />
          </div>
          <div className="lg:col-span-2">
            <ProgressOverview />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}