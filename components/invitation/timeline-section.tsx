'use client';

import { motion } from 'framer-motion';
import { Reveal, Stagger, fadeUp } from '@/components/ui/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { useTranslations } from 'next-intl';

interface TimelineEntry {
  time: string;
  title: string;
  description: string;
  icon: string;
}

const timelineData: TimelineEntry[] = [
  { time: '15:00', title: 'Церемония', icon: '💍', description: 'Торжественная церемония бракосочетания' },
  { time: '16:00', title: 'Фуршет', icon: '🥂', description: 'Приветственный коктейль и закуски' },
  { time: '17:00', title: 'Банкет', icon: '🍽', description: 'Праздничный ужин' },
  { time: '19:00', title: 'Торт', icon: '🎂', description: 'Разрезание свадебного торта' },
  { time: '20:00', title: 'Танцы', icon: '💃', description: 'Первый танец и вечеринка' },
];

// These will come from DB eventually — for now, locale-aware via mapping
const timelineDataIt: TimelineEntry[] = [
  { time: '15:00', title: 'Cerimonia', icon: '💍', description: 'Cerimonia nuziale' },
  { time: '16:00', title: 'Aperitivo', icon: '🥂', description: 'Cocktail di benvenuto e stuzzichini' },
  { time: '17:00', title: 'Cena', icon: '🍽', description: 'Cena di gala' },
  { time: '19:00', title: 'Torta', icon: '🎂', description: 'Taglio della torta nuziale' },
  { time: '20:00', title: 'Ballo', icon: '💃', description: 'Primo ballo e festa' },
];

export function TimelineSection() {
  const t = useTranslations('timeline');
  const locale = useTranslations()('timeline.title') === 'Программа дня' ? 'ru' : 'it';
  const items = locale === 'ru' ? timelineData : timelineDataIt;

  return (
    <section id="timeline" className="px-8 sm:px-12 py-16">
      <Reveal>
        <SectionHeading title={t('title')} />
      </Reveal>

      <Stagger className="relative max-w-md mx-auto">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden sm:block" />

        {items.map((item, index) => (
          <motion.div
            key={item.time}
            variants={fadeUp}
            className="relative flex items-start gap-4 sm:gap-0 mb-10 last:mb-0"
          >
            {/* Mobile layout: single column */}
            <div className="sm:hidden flex gap-4 items-start w-full">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-parchment border border-border-light flex items-center justify-center text-lg">
                {item.icon}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-xs uppercase tracking-[0.2em] text-gold font-sans font-medium">
                  {item.time}
                </p>
                <h3 className="font-serif text-lg text-ink mt-0.5">{item.title}</h3>
                <p className="text-xs text-ink-muted font-sans mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Desktop layout: alternating left/right */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_48px_1fr] sm:gap-0 w-full items-start">
              {/* Left side */}
              <div className={index % 2 === 0 ? 'text-right pr-6 pt-1' : ''}>
                {index % 2 === 0 && (
                  <>
                    <p className="text-xs uppercase tracking-[0.2em] text-gold font-sans font-medium">
                      {item.time}
                    </p>
                    <h3 className="font-serif text-lg text-ink mt-0.5">{item.title}</h3>
                    <p className="text-xs text-ink-muted font-sans mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </>
                )}
              </div>

              {/* Center dot */}
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-parchment border border-border-light flex items-center justify-center text-base z-10">
                  {item.icon}
                </div>
              </div>

              {/* Right side */}
              <div className={index % 2 !== 0 ? 'pl-6 pt-1' : ''}>
                {index % 2 !== 0 && (
                  <>
                    <p className="text-xs uppercase tracking-[0.2em] text-gold font-sans font-medium">
                      {item.time}
                    </p>
                    <h3 className="font-serif text-lg text-ink mt-0.5">{item.title}</h3>
                    <p className="text-xs text-ink-muted font-sans mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </Stagger>
    </section>
  );
}
