import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { GuestImport } from '@/components/wedding/GuestImport';
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
import { Plus, Users, Trash2, Loader2, UserCheck, UserX, Clock, Mail, Phone, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Guests() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { wedding, guests, refreshData, loading: weddingLoading } = useWedding();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'attending' | 'not_attending' | 'pending'>('all');
  const [newGuest, setNewGuest] = useState({
    full_name: '',
    email: '',
    phone: '',
    plus_one: false,
    plus_one_name: '',
    dietary_preferences: '',
    table_assignment: '',
  });

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!wedding && !weddingLoading) return <Navigate to="/onboarding" replace />;

  const filteredGuests = guests.filter(guest => {
    if (filter === 'all') return true;
    return guest.rsvp_status === filter;
  });

  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.rsvp_status === 'attending').length,
    notAttending: guests.filter(g => g.rsvp_status === 'not_attending').length,
    pending: guests.filter(g => g.rsvp_status === 'pending').length,
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuest.full_name.trim() || !wedding) return;

    setSaving(true);
    const { error } = await supabase.from('guests').insert({
      wedding_id: wedding.id,
      full_name: newGuest.full_name.trim(),
      email: newGuest.email.trim() || null,
      phone: newGuest.phone.trim() || null,
      plus_one: newGuest.plus_one,
      plus_one_name: newGuest.plus_one_name.trim() || null,
      dietary_preferences: newGuest.dietary_preferences.trim() || null,
      table_assignment: newGuest.table_assignment.trim() || null,
    });

    if (error) {
      toast.error(t('guests.toast.failedAdd'));
    } else {
      toast.success(t('guests.toast.added'));
      setNewGuest({
        full_name: '',
        email: '',
        phone: '',
        plus_one: false,
        plus_one_name: '',
        dietary_preferences: '',
        table_assignment: '',
      });
      setDialogOpen(false);
      refreshData();
    }
    setSaving(false);
  };

  const updateRsvp = async (guestId: string, status: 'pending' | 'attending' | 'not_attending' | 'maybe') => {
    const { error } = await supabase
      .from('guests')
      .update({ rsvp_status: status })
      .eq('id', guestId);

    if (error) {
      toast.error(t('guests.toast.failedUpdate'));
    } else {
      refreshData();
    }
  };

  const deleteGuest = async (guestId: string) => {
    const { error } = await supabase.from('guests').delete().eq('id', guestId);
    if (error) {
      toast.error(t('guests.toast.failedDelete'));
    } else {
      toast.success(t('guests.toast.removed'));
      refreshData();
    }
  };

  const rsvpColors = {
    attending: 'bg-sage-light text-sage border-sage/20',
    not_attending: 'bg-muted text-muted-foreground border-muted-foreground/20',
    pending: 'bg-gold-light text-gold border-gold/20',
    maybe: 'bg-champagne text-charcoal border-charcoal/20',
  };

  const getFilterLabel = (status: string) => {
    const filterMap: Record<string, string> = {
      all: t('common.all'),
      attending: t('guests.stats.attending'),
      pending: t('guests.stats.pending'),
      not_attending: t('guests.stats.declined'),
    };
    return filterMap[status] || status;
  };

  const getRsvpLabel = (status: string) => {
    const rsvpMap: Record<string, string> = {
      pending: t('guests.rsvp.pending'),
      attending: t('guests.rsvp.attending'),
      not_attending: t('guests.rsvp.not_attending'),
      maybe: t('guests.rsvp.maybe'),
    };
    return rsvpMap[status] || status;
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">{t('guests.title')}</h1>
            <p className="text-muted-foreground">{stats.total} {t('guests.invited')}</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {t('guests.import.title')}
            </Button>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('guests.addGuest')}
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{t('guests.addGuest')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGuest} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{t('guests.fullName')}</Label>
                  <Input
                    placeholder={t('guests.enterGuestName')}
                    value={newGuest.full_name}
                    onChange={(e) => setNewGuest({ ...newGuest, full_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('guests.emailOptional')}</Label>
                    <Input
                      type="email"
                      placeholder="email@ejemplo.com"
                      value={newGuest.email}
                      onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('guests.phoneOptional')}</Label>
                    <Input
                      type="tel"
                      placeholder="+54 11 1234 5678"
                      value={newGuest.phone}
                      onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="plusOne"
                    checked={newGuest.plus_one}
                    onCheckedChange={(checked) => setNewGuest({ ...newGuest, plus_one: !!checked })}
                  />
                  <Label htmlFor="plusOne" className="cursor-pointer">{t('guests.hasPlusOne')}</Label>
                </div>
                {newGuest.plus_one && (
                  <div className="space-y-2">
                    <Label>{t('guests.plusOneName')}</Label>
                    <Input
                      placeholder={t('guests.enterPlusOneName')}
                      value={newGuest.plus_one_name}
                      onChange={(e) => setNewGuest({ ...newGuest, plus_one_name: e.target.value })}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>{t('guests.dietaryPreferences')} ({t('common.optional')})</Label>
                  <Input
                    placeholder={t('guests.dietaryPlaceholder')}
                    value={newGuest.dietary_preferences}
                    onChange={(e) => setNewGuest({ ...newGuest, dietary_preferences: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('guests.addGuest')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Import Dialog */}
        {wedding && (
          <GuestImport
            open={importDialogOpen}
            onOpenChange={setImportDialogOpen}
            weddingId={wedding.id}
            onImportComplete={refreshData}
          />
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="font-display text-2xl font-semibold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">{t('guests.stats.total')}</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <UserCheck className="h-5 w-5 mx-auto mb-2 text-sage" />
            <p className="font-display text-2xl font-semibold">{stats.attending}</p>
            <p className="text-xs text-muted-foreground">{t('guests.stats.attending')}</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-2 text-gold" />
            <p className="font-display text-2xl font-semibold">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">{t('guests.stats.pending')}</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <UserX className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="font-display text-2xl font-semibold">{stats.notAttending}</p>
            <p className="text-xs text-muted-foreground">{t('guests.stats.declined')}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'attending', 'pending', 'not_attending'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="whitespace-nowrap"
            >
              {getFilterLabel(status)}
            </Button>
          ))}
        </div>

        {/* Guest list */}
        <div className="space-y-3">
          {filteredGuests.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">{t('guests.noGuests')}</h3>
              <p className="text-muted-foreground">{t('guests.startBuilding')}</p>
            </div>
          ) : (
            filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className="glass-card rounded-xl p-4 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium truncate">{guest.full_name}</p>
                      <Badge variant="outline" className={cn("text-xs shrink-0", rsvpColors[guest.rsvp_status as keyof typeof rsvpColors])}>
                        {getRsvpLabel(guest.rsvp_status || 'pending')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {guest.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {guest.email}
                        </span>
                      )}
                      {guest.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {guest.phone}
                        </span>
                      )}
                      {guest.plus_one && (
                        <span>+1{guest.plus_one_name && `: ${guest.plus_one_name}`}</span>
                      )}
                      {guest.dietary_preferences && (
                        <span>{t('guests.dietaryPreferences')}: {guest.dietary_preferences}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={guest.rsvp_status || 'pending'}
                      onValueChange={(value: 'pending' | 'attending' | 'not_attending' | 'maybe') => updateRsvp(guest.id, value)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t('guests.rsvp.pending')}</SelectItem>
                        <SelectItem value="attending">{t('guests.rsvp.attending')}</SelectItem>
                        <SelectItem value="not_attending">{t('guests.rsvp.not_attending')}</SelectItem>
                        <SelectItem value="maybe">{t('guests.rsvp.maybe')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => deleteGuest(guest.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}