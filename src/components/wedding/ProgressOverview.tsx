import { useTranslation } from 'react-i18next';
import { useWedding } from '@/contexts/WeddingContext';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';

export function ProgressOverview() {
  const { t } = useTranslation();
  const { tasks, categories } = useWedding();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate progress per category
  const categoryProgress = categories.map(category => {
    const categoryTasks = tasks.filter(t => t.category_id === category.id);
    const completed = categoryTasks.filter(t => t.status === 'completed').length;
    const total = categoryTasks.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    
    return {
      ...category,
      completed,
      total,
      progress,
    };
  }).filter(c => c.total > 0);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-full bg-gold-light p-2">
          <Sparkles className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold">{t('progress.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {completedTasks} {t('tasks.of')} {totalTasks} {t('tasks.completed')}
          </p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{t('progress.overallProgress')}</span>
          <span className="text-sm text-muted-foreground">{overallProgress.toFixed(0)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Category breakdown */}
      {categoryProgress.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('tasks.category')}</p>
          {categoryProgress.slice(0, 4).map((category) => (
            <div key={category.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  {category.completed}/{category.total}
                </span>
              </div>
              <Progress value={category.progress} className="h-1.5" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}