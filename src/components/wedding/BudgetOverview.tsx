import { useTranslation } from 'react-i18next';
import { useWedding } from '@/contexts/WeddingContext';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export function BudgetOverview() {
  const { t, i18n } = useTranslation();
  const { wedding, budgetItems, categories } = useWedding();

  const totalBudget = Number(wedding?.total_budget) || 0;
  const totalSpent = budgetItems.reduce((sum, item) => sum + Number(item.actual_cost || 0), 0);
  const totalEstimated = budgetItems.reduce((sum, item) => sum + Number(item.estimated_cost || 0), 0);
  const remaining = totalBudget - totalSpent;
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const formatCurrency = (amount: number) => {
    const locale = i18n.language === 'es' ? 'es-AR' : 'en-US';
    const currency = i18n.language === 'es' ? 'ARS' : 'USD';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      label: t('budget.totalBudget'),
      value: formatCurrency(totalBudget),
      icon: Wallet,
      color: 'text-sage',
    },
    {
      label: t('budget.spent'),
      value: formatCurrency(totalSpent),
      icon: TrendingDown,
      color: 'text-rose-dark',
    },
    {
      label: t('budget.remaining'),
      value: formatCurrency(remaining),
      icon: TrendingUp,
      color: remaining >= 0 ? 'text-sage' : 'text-destructive',
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-full bg-sage-light p-2">
          <DollarSign className="h-5 w-5 text-sage" />
        </div>
        <h3 className="font-display text-xl font-semibold">{t('budgetPreview.title')}</h3>
      </div>

      <div className="space-y-6">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              {percentUsed.toFixed(1)}% {t('budget.budgetUsage').toLowerCase()}
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
            </span>
          </div>
          <Progress 
            value={Math.min(percentUsed, 100)} 
            className="h-3"
          />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <Icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                <p className="font-display text-lg font-semibold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Category breakdown preview */}
        {categories.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">{t('tasks.category')}</p>
            <div className="space-y-2">
              {categories.slice(0, 3).map((category) => {
                const categoryBudget = budgetItems
                  .filter(item => item.category_id === category.id)
                  .reduce((sum, item) => sum + Number(item.actual_cost || 0), 0);
                const allocated = Number(category.budget_allocated) || 0;
                const percent = allocated > 0 ? (categoryBudget / allocated) * 100 : 0;

                return (
                  <div key={category.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{category.name}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(categoryBudget)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}