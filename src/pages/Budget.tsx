import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, DollarSign, Trash2, Loader2, TrendingUp, TrendingDown, Wallet, Settings, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Budget() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { wedding, budgetItems, categories, refreshData, loading: weddingLoading } = useWedding();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [addFundsDialogOpen, setAddFundsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category_id: '',
    estimated_cost: '',
    actual_cost: '',
  });
  const [newBudget, setNewBudget] = useState('');
  const [fundsToAdd, setFundsToAdd] = useState('');

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!wedding && !weddingLoading) return <Navigate to="/onboarding" replace />;

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
    }).format(amount);
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim() || !wedding) return;

    setSaving(true);
    const { error } = await supabase.from('budget_items').insert({
      wedding_id: wedding.id,
      name: newItem.name.trim(),
      category_id: newItem.category_id || null,
      estimated_cost: parseFloat(newItem.estimated_cost) || 0,
      actual_cost: parseFloat(newItem.actual_cost) || 0,
    });

    if (error) {
      toast.error(t('budget.toast.failedAdd'));
    } else {
      toast.success(t('budget.toast.added'));
      setNewItem({ name: '', category_id: '', estimated_cost: '', actual_cost: '' });
      setDialogOpen(false);
      refreshData();
    }
    setSaving(false);
  };

  const deleteItem = async (itemId: string) => {
    const { error } = await supabase.from('budget_items').delete().eq('id', itemId);
    if (error) {
      toast.error(t('budget.toast.failedDelete'));
    } else {
      toast.success(t('budget.toast.deleted'));
      refreshData();
    }
  };

  const handleConfigureBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wedding || !newBudget) return;

    setSaving(true);
    const { error } = await supabase
      .from('weddings')
      .update({ total_budget: parseFloat(newBudget) })
      .eq('id', wedding.id);

    if (error) {
      toast.error(t('budget.toast.failedUpdate'));
    } else {
      toast.success(t('budget.toast.budgetUpdated'));
      setConfigDialogOpen(false);
      setNewBudget('');
      refreshData();
    }
    setSaving(false);
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wedding || !fundsToAdd) return;

    const amountToAdd = parseFloat(fundsToAdd);
    if (isNaN(amountToAdd) || amountToAdd <= 0) return;

    setSaving(true);
    const newTotal = totalBudget + amountToAdd;
    const { error } = await supabase
      .from('weddings')
      .update({ total_budget: newTotal })
      .eq('id', wedding.id);

    if (error) {
      toast.error(t('budget.toast.failedUpdate'));
    } else {
      toast.success(t('budget.toast.fundsAdded'));
      setAddFundsDialogOpen(false);
      setFundsToAdd('');
      refreshData();
    }
    setSaving(false);
  };

  // Group items by category
  const itemsByCategory = categories.map(category => ({
    ...category,
    items: budgetItems.filter(item => item.category_id === category.id),
    total: budgetItems
      .filter(item => item.category_id === category.id)
      .reduce((sum, item) => sum + Number(item.actual_cost || 0), 0),
  })).filter(c => c.items.length > 0);

  const uncategorizedItems = budgetItems.filter(item => !item.category_id);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">{t('budget.title')}</h1>
            <p className="text-muted-foreground">{t('budget.subtitle')}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Configure Budget Dialog */}
            <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setNewBudget(totalBudget.toString())}>
                  <Settings className="h-4 w-4 mr-2" />
                  {t('budget.configureBudget')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">{t('budget.setInitialBudget')}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">{t('budget.initialBudgetDescription')}</p>
                <form onSubmit={handleConfigureBudget} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>{t('budget.currentBudget')}</Label>
                    <p className="text-lg font-medium text-muted-foreground">{formatCurrency(totalBudget)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('budget.newBudget')}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-7"
                        value={newBudget}
                        onChange={(e) => setNewBudget(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={saving || !newBudget}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.save')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Add Funds Dialog */}
            <Dialog open={addFundsDialogOpen} onOpenChange={setAddFundsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {t('budget.addFunds')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">{t('budget.addFunds')}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">{t('budget.addFundsDescription')}</p>
                <form onSubmit={handleAddFunds} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>{t('budget.currentBudget')}</Label>
                    <p className="text-lg font-medium text-muted-foreground">{formatCurrency(totalBudget)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('budget.amountToAdd')}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-7"
                        value={fundsToAdd}
                        onChange={(e) => setFundsToAdd(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={saving || !fundsToAdd}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('budget.addFunds')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Add Expense Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('budget.addExpense')}
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{t('budget.addExpense')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateItem} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{t('budget.name')}</Label>
                  <Input
                    placeholder={t('budget.namePlaceholder')}
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('tasks.category')}</Label>
                  <Select
                    value={newItem.category_id}
                    onValueChange={(value) => setNewItem({ ...newItem, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('budget.estimatedCost')}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-7"
                        value={newItem.estimated_cost}
                        onChange={(e) => setNewItem({ ...newItem, estimated_cost: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('budget.actualCost')}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-7"
                        value={newItem.actual_cost}
                        onChange={(e) => setNewItem({ ...newItem, actual_cost: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('budget.addExpense')}
                </Button>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full bg-sage-light p-2">
                <Wallet className="h-5 w-5 text-sage" />
              </div>
              <span className="text-sm text-muted-foreground">{t('budget.totalBudget')}</span>
            </div>
            <p className="font-display text-2xl font-semibold">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full bg-rose-light p-2">
                <TrendingDown className="h-5 w-5 text-rose-dark" />
              </div>
              <span className="text-sm text-muted-foreground">{t('budget.spent')}</span>
            </div>
            <p className="font-display text-2xl font-semibold">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("rounded-full p-2", remaining >= 0 ? "bg-sage-light" : "bg-destructive/10")}>
                <TrendingUp className={cn("h-5 w-5", remaining >= 0 ? "text-sage" : "text-destructive")} />
              </div>
              <span className="text-sm text-muted-foreground">{t('budget.remaining')}</span>
            </div>
            <p className={cn("font-display text-2xl font-semibold", remaining < 0 && "text-destructive")}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium">{t('budget.budgetUsage')}</span>
            <span className="text-sm text-muted-foreground">{percentUsed.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(percentUsed, 100)} className="h-3" />
        </div>

        {/* Category breakdown */}
        {itemsByCategory.length > 0 && (
          <div className="space-y-4">
            {itemsByCategory.map((category) => (
              <div key={category.id} className="glass-card rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">{category.name}</h3>
                  <span className="text-sm text-muted-foreground">{formatCurrency(category.total)}</span>
                </div>
                <div className="divide-y divide-border">
                  {category.items.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between group">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {Number(item.estimated_cost) > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {t('budget.est')}: {formatCurrency(Number(item.estimated_cost))}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{formatCurrency(Number(item.actual_cost) || 0)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Uncategorized items */}
        {uncategorizedItems.length > 0 && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-display text-lg font-semibold">{t('budget.otherExpenses')}</h3>
            </div>
            <div className="divide-y divide-border">
              {uncategorizedItems.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between group">
                  <div>
                    <p className="font-medium">{item.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatCurrency(Number(item.actual_cost) || 0)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {budgetItems.length === 0 && (
          <div className="text-center py-12 glass-card rounded-2xl">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">{t('budget.noExpenses')}</h3>
            <p className="text-muted-foreground">{t('budget.startTracking')}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}