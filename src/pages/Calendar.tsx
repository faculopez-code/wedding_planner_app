import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useState } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, CheckSquare, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Calendar() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { wedding, tasks, loading: weddingLoading } = useWedding();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const dateLocale = i18n.language === 'es' ? es : undefined;

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!wedding && !weddingLoading) return <Navigate to="/onboarding" replace />;

  // Get tasks for selected date
  const tasksForDate = selectedDate
    ? tasks.filter(task => task.due_date && isSameDay(parseISO(task.due_date), selectedDate))
    : [];

  // Get all dates that have tasks
  const datesWithTasks = tasks
    .filter(t => t.due_date)
    .map(t => parseISO(t.due_date!));

  const weddingDate = wedding?.wedding_date ? parseISO(wedding.wedding_date) : null;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-semibold">{t('calendar.title')}</h1>
          <p className="text-muted-foreground">{t('calendar.subtitle')}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
          {/* Calendar */}
          <div className="glass-card rounded-2xl p-6">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
              locale={dateLocale}
              modifiers={{
                hasTask: datesWithTasks,
                weddingDay: weddingDate ? [weddingDate] : [],
              }}
              modifiersStyles={{
                hasTask: {
                  fontWeight: 'bold',
                },
                weddingDay: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  borderRadius: '50%',
                },
              }}
            />
            
            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                {t('calendar.legend.weddingDay')}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-foreground/20" />
                {t('calendar.legend.hasTasks')}
              </div>
            </div>
          </div>

          {/* Selected date details */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-rose-light p-2">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">
                  {selectedDate ? format(selectedDate, "d 'de' MMMM, yyyy", { locale: dateLocale }) : t('calendar.selectDate')}
                </h3>
                {selectedDate && weddingDate && isSameDay(selectedDate, weddingDate) && (
                  <Badge className="mt-1">{t('calendar.weddingDay')}</Badge>
                )}
              </div>
            </div>

            {tasksForDate.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  {tasksForDate.length} {tasksForDate.length === 1 ? t('calendar.tasksDue') : t('calendar.tasksDue_plural')}
                </p>
                {tasksForDate.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg bg-muted/50",
                      task.status === 'completed' && "opacity-60"
                    )}
                  >
                    {task.status === 'completed' ? (
                      <CheckSquare className="h-5 w-5 text-sage mt-0.5" />
                    ) : task.status === 'in_progress' ? (
                      <Clock className="h-5 w-5 text-gold mt-0.5" />
                    ) : (
                      <CheckSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <p className={cn(
                        "font-medium",
                        task.status === 'completed' && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedDate ? (
              <div className="text-center py-8">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">{t('calendar.noTasksThisDay')}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}