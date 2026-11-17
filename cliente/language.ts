import type { DeckLanguage } from './types';

/** Device locale ("pt-PT", "es_MX", "fr") to deck language: pt → pt-BR, es → es, anything else → en. */
export function deckLanguage(locale: string | undefined | null): DeckLanguage {
  const base = (locale ?? '').toLowerCase().split(/[-_]/)[0];
  if (base === 'pt') return 'pt-BR';
  if (base === 'es') return 'es';
  return 'en';
}

/** Device locale from Intl, available in Hermes. Falls back to "en". */
export function deviceLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || 'en';
  } catch {
    return 'en';
  }
}
