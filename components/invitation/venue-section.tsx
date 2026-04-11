'use client';

import { Reveal } from '@/components/ui/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { useTranslations } from 'next-intl';

export function VenueSection() {
  const t = useTranslations('venue');

  return (
    <section id="venue" className="px-8 sm:px-12 py-16">
      <Reveal>
        <SectionHeading title={t('title')} />
      </Reveal>

      <Reveal delay={0.1}>
        <div className="max-w-md mx-auto text-center space-y-4">
          {/* Venue name */}
          <h3 className="font-serif text-xl text-ink">Villa Balbiano</h3>
          <p className="text-sm text-ink-light font-sans leading-relaxed">
            Via Provinciale, 34<br />
            22010 Ossuccio CO, Italia
          </p>

          {/* Decorative map placeholder */}
          <div className="mt-8 rounded-sm overflow-hidden border border-border-light">
            <div className="aspect-[16/9] bg-parchment flex items-center justify-center">
              <div className="text-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="mx-auto text-ink-muted/50 mb-2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p className="text-xs text-ink-muted font-sans">{t('howToGet')}</p>
              </div>
            </div>
          </div>

          {/* Google Maps link */}
          <a
            href="https://maps.google.com/?q=Villa+Balbiano+Ossuccio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-xs uppercase tracking-[0.2em] text-ink-muted hover:text-ink border-b border-border hover:border-ink-muted transition-colors font-sans pb-0.5"
          >
            Google Maps →
          </a>
        </div>
      </Reveal>
    </section>
  );
}
