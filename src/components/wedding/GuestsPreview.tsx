import { useTranslation } from 'react-i18next';
import { useWedding } from '@/contexts/WeddingContext';
import { Link } from 'react-router-dom';
import { Users, UserCheck, UserX, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GuestsPreview() {
  const { t } = useTranslation();
  const { guests } = useWedding();

  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.rsvp_status === 'attending').length,
    notAttending: guests.filter(g => g.rsvp_status === 'not_attending').length,
    pending: guests.filter(g => g.rsvp_status === 'pending').length,
    maybe: guests.filter(g => g.rsvp_status === 'maybe').length,
  };

  const plusOnes = guests.filter(g => g.plus_one).length;
  const totalExpected = stats.attending + plusOnes;

  const statItems = [
    { 
      label: t('guests.stats.attending'), 
      value: stats.attending, 
      icon: UserCheck, 
      color: 'text-sage bg-sage-light' 
    },
    { 
      label: t('guests.stats.pending'), 
      value: stats.pending, 
      icon: Clock, 
      color: 'text-gold bg-gold-light' 
    },
    { 
      label: t('guests.stats.declined'), 
      value: stats.notAttending, 
      icon: UserX, 
      color: 'text-muted-foreground bg-muted' 
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-champagne p-2">
            <Users className="h-5 w-5 text-charcoal" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">{t('guests.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {stats.total} {t('guests.invited')}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/guests" className="flex items-center gap-1">
            {t('guests.manage')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="text-center">
              <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-display text-2xl font-semibold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{t('guests.expectedAttendance')}</span>
          <span className="font-display text-lg font-semibold">{totalExpected}</span>
        </div>
        {plusOnes > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {t('guests.includingPlusOnes', { count: plusOnes })}
          </p>
        )}
      </div>
    </div>
  );
}