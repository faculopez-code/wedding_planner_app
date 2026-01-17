import { useTranslation } from 'react-i18next';
import { useWedding } from '@/contexts/WeddingContext';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, ArrowRight, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function TasksPreview() {
  const { t, i18n } = useTranslation();
  const { tasks } = useWedding();

  const dateLocale = i18n.language === 'es' ? es : undefined;

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const upcomingTasks = pendingTasks
    .filter(t => t.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  const formatDueDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return i18n.language === 'es' ? 'Hoy' : 'Today';
    if (isTomorrow(date)) return i18n.language === 'es' ? 'Mañana' : 'Tomorrow';
    return format(date, 'd MMM', { locale: dateLocale });
  };

  const getDueDateColor = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isPast(date) && !isToday(date)) return 'text-destructive';
    if (isToday(date)) return 'text-primary';
    return 'text-muted-foreground';
  };

  const priorityColors = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-gold-light text-gold border-gold/20',
    low: 'bg-sage-light text-sage border-sage/20',
  };

  const getPriorityLabel = (priority: string) => {
    const priorityMap: Record<string, string> = {
      low: t('tasks.priorityLevel.low'),
      medium: t('tasks.priorityLevel.medium'),
      high: t('tasks.priorityLevel.high'),
    };
    return priorityMap[priority] || priority;
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-rose-light p-2">
            <CheckSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">{t('tasks.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {completedCount} {t('tasks.of')} {tasks.length} {t('tasks.completed')}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/tasks" className="flex items-center gap-1">
            {t('tasksPreview.viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {upcomingTasks.length > 0 ? (
        <div className="space-y-3">
          {upcomingTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {task.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-sage mt-0.5 flex-shrink-0" />
              ) : task.status === 'in_progress' ? (
                <Clock className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  task.status === 'completed' && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {task.due_date && (
                    <span className={cn("text-xs", getDueDateColor(task.due_date))}>
                      {formatDueDate(task.due_date)}
                    </span>
                  )}
                  {task.priority && (
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs py-0 px-1.5", priorityColors[task.priority as keyof typeof priorityColors])}
                    >
                      {getPriorityLabel(task.priority)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <CheckCircle2 className="h-12 w-12 mx-auto text-sage mb-3" />
          <p className="text-muted-foreground">{t('tasksPreview.noPendingTasks')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('tasksPreview.enjoyPlanning')}</p>
        </div>
      )}
    </div>
  );
}