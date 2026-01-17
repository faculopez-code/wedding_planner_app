import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, CheckSquare, Circle, Clock, CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Tasks() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { wedding, tasks, categories, refreshData, loading: weddingLoading } = useWedding();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category_id: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
  });

  const dateLocale = i18n.language === 'es' ? es : undefined;

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!wedding && !weddingLoading) return <Navigate to="/onboarding" replace />;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim() || !wedding) return;

    setSaving(true);
    const { error } = await supabase.from('tasks').insert({
      wedding_id: wedding.id,
      title: newTask.title.trim(),
      description: newTask.description.trim() || null,
      category_id: newTask.category_id || null,
      priority: newTask.priority,
      due_date: newTask.due_date || null,
    });

    if (error) {
      toast.error(t('tasks.toast.failedCreate'));
    } else {
      toast.success(t('tasks.toast.created'));
      setNewTask({ title: '', description: '', category_id: '', priority: 'medium', due_date: '' });
      setDialogOpen(false);
      refreshData();
    }
    setSaving(false);
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const { error } = await supabase
      .from('tasks')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', taskId);

    if (error) {
      toast.error(t('tasks.toast.failedUpdate'));
    } else {
      refreshData();
    }
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) {
      toast.error(t('tasks.toast.failedDelete'));
    } else {
      toast.success(t('tasks.toast.deleted'));
      refreshData();
    }
  };

  const priorityColors = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-gold-light text-gold border-gold/20',
    low: 'bg-sage-light text-sage border-sage/20',
  };

  const statusIcons = {
    pending: Circle,
    in_progress: Clock,
    completed: CheckCircle2,
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      all: t('tasks.status.all'),
      pending: t('tasks.status.pending'),
      in_progress: t('tasks.status.in_progress'),
      completed: t('tasks.status.completed'),
    };
    return statusMap[status] || status;
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
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">{t('tasks.title')}</h1>
            <p className="text-muted-foreground">
              {tasks.filter(t => t.status === 'completed').length} {t('tasks.of')} {tasks.length} {t('tasks.completed')}
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('tasks.addTask')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{t('tasks.newTask')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{t('tasks.taskTitle')}</Label>
                  <Input
                    placeholder={t('tasks.taskTitlePlaceholder')}
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('tasks.descriptionOptional')}</Label>
                  <Input
                    placeholder={t('tasks.addDetails')}
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('tasks.category')}</Label>
                    <Select
                      value={newTask.category_id}
                      onValueChange={(value) => setNewTask({ ...newTask, category_id: value })}
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
                  <div className="space-y-2">
                    <Label>{t('tasks.priority')}</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value as 'low' | 'medium' | 'high' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('tasks.priorityLevel.low')}</SelectItem>
                        <SelectItem value="medium">{t('tasks.priorityLevel.medium')}</SelectItem>
                        <SelectItem value="high">{t('tasks.priorityLevel.high')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('tasks.dueDateOptional')}</Label>
                  <Input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('tasks.createTask')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="whitespace-nowrap"
            >
              {getStatusLabel(status)}
            </Button>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl">
              <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">{t('tasks.noTasks')}</h3>
              <p className="text-muted-foreground">{t('tasks.addFirstTask')}</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Circle;
              const category = categories.find(c => c.id === task.category_id);
              const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date)) && task.status !== 'completed';

              return (
                <div
                  key={task.id}
                  className={cn(
                    "glass-card rounded-xl p-4 flex items-start gap-4 group",
                    task.status === 'completed' && "opacity-60"
                  )}
                >
                  <Checkbox
                    checked={task.status === 'completed'}
                    onCheckedChange={() => toggleTaskStatus(task.id, task.status || 'pending')}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <p className={cn(
                        "font-medium",
                        task.status === 'completed' && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </p>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {category && (
                        <Badge variant="outline" className="text-xs">{category.name}</Badge>
                      )}
                      {task.priority && (
                        <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority as keyof typeof priorityColors])}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      )}
                      {task.due_date && (
                        <span className={cn("text-xs", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                          {t('tasks.due')} {format(parseISO(task.due_date), 'd MMM', { locale: dateLocale })}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}