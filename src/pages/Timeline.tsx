import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Clock, Trash2, Loader2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type TimelineEvent = Tables<'timeline_events'>;

export default function Timeline() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { wedding, loading: weddingLoading, refreshData } = useWedding();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    assigned_to: '',
  });

  // Fetch timeline events
  const fetchEvents = async () => {
    if (!wedding) return;
    const { data } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('wedding_id', wedding.id)
      .order('start_time');
    if (data) setEvents(data);
  };

  useEffect(() => {
    if (wedding) fetchEvents();
  }, [wedding]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!wedding && !weddingLoading) return <Navigate to="/onboarding" replace />;

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.start_time || !wedding) return;

    setSaving(true);
    const { error } = await supabase.from('timeline_events').insert({
      wedding_id: wedding.id,
      title: newEvent.title.trim(),
      description: newEvent.description.trim() || null,
      start_time: newEvent.start_time,
      end_time: newEvent.end_time || null,
      location: newEvent.location.trim() || null,
      assigned_to: newEvent.assigned_to.trim() || null,
    });

    if (error) {
      toast.error(t('timeline.toast.failedAdd'));
    } else {
      toast.success(t('timeline.toast.added'));
      setNewEvent({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        assigned_to: '',
      });
      setDialogOpen(false);
      fetchEvents();
    }
    setSaving(false);
  };

  const deleteEvent = async (eventId: string) => {
    const { error } = await supabase.from('timeline_events').delete().eq('id', eventId);
    if (error) {
      toast.error(t('timeline.toast.failedDelete'));
    } else {
      toast.success(t('timeline.toast.deleted'));
      fetchEvents();
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">{t('timeline.title')}</h1>
            <p className="text-muted-foreground">{t('timeline.subtitle')}</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('timeline.addEvent')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{t('timeline.addTimelineEvent')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{t('timeline.eventName')}</Label>
                  <Input
                    placeholder={t('timeline.eventNamePlaceholder')}
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('timeline.startTime')}</Label>
                    <Input
                      type="time"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('timeline.endTimeOptional')}</Label>
                    <Input
                      type="time"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('timeline.locationOptional')}</Label>
                  <Input
                    placeholder={t('timeline.locationPlaceholder')}
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('timeline.assignedToOptional')}</Label>
                  <Input
                    placeholder={t('timeline.assignedToPlaceholder')}
                    value={newEvent.assigned_to}
                    onChange={(e) => setNewEvent({ ...newEvent, assigned_to: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('tasks.descriptionOptional')}</Label>
                  <Input
                    placeholder={t('tasks.addDetails')}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('timeline.addEvent')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Timeline */}
        {events.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">{t('timeline.noEvents')}</h3>
            <p className="text-muted-foreground">{t('timeline.startPlanning')}</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={event.id} className="relative pl-16 group">
                  {/* Timeline dot */}
                  <div className="absolute left-4 top-6 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-sm" />
                  
                  <div className="glass-card rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-primary">
                            {formatTime(event.start_time)}
                            {event.end_time && ` - ${formatTime(event.end_time)}`}
                          </span>
                        </div>
                        <h3 className="font-display text-lg font-semibold mb-1">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {event.location && (
                            <span>📍 {event.location}</span>
                          )}
                          {event.assigned_to && (
                            <span>👤 {event.assigned_to}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}