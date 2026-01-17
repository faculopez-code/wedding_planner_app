import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, parseISO } from 'date-fns';
import { Heart } from 'lucide-react';

interface CountdownTimerProps {
  weddingDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ weddingDate }: CountdownTimerProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const targetDate = parseISO(weddingDate);

    const calculateTimeLeft = () => {
      const now = new Date();
      const days = differenceInDays(targetDate, now);
      const hours = differenceInHours(targetDate, now) % 24;
      const minutes = differenceInMinutes(targetDate, now) % 60;
      const seconds = differenceInSeconds(targetDate, now) % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  if (!mounted) return null;

  const timeUnits = [
    { label: t('dashboard.countdown.days'), value: timeLeft.days },
    { label: t('dashboard.countdown.hours'), value: timeLeft.hours },
    { label: t('dashboard.countdown.minutes'), value: timeLeft.minutes },
    { label: t('dashboard.countdown.seconds'), value: timeLeft.seconds },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-light via-background to-sage-light p-8 text-center shadow-card">
      <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary/5" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-sage/5" />
      
      <div className="relative">
        <Heart className="mx-auto mb-4 h-8 w-8 text-primary animate-pulse-soft" />
        <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
          {t('dashboard.countdown.title')}
        </h3>
        <p className="text-muted-foreground mb-8 text-sm">
          {t('dashboard.countdown.approaching')}
        </p>

        <div className="grid grid-cols-4 gap-4">
          {timeUnits.map((unit) => (
            <div key={unit.label} className="relative">
              <div className="glass-card rounded-xl py-4 px-2">
                <span className="block font-display text-3xl md:text-4xl font-semibold text-primary">
                  {unit.value.toString().padStart(2, '0')}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1 block">
                  {unit.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}