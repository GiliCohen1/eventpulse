type TranslationMap = Record<string, unknown>;

let translations: TranslationMap = {};

function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Initialise translations by fetching the locale JSON from /locales/.
 * Must be called (and awaited) before the React tree renders so that
 * every call to `t()` can resolve synchronously.
 */
export async function initI18n(locale = 'en'): Promise<void> {
  try {
    const res = await fetch(`/locales/${locale}.json`);
    if (res.ok) {
      translations = (await res.json()) as TranslationMap;
    }
  } catch {
    // Translations stay empty – `t()` will return the key as fallback.
  }
}

/**
 * Translate a dot-notated key, optionally interpolating `{{param}}` placeholders.
 *
 * @example
 *   t('common.appName')                     // "EventPulse"
 *   t('common.copyright', { year: 2026 })   // "© 2026 EventPulse. All rights reserved."
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const value = getNestedValue(translations, key);
  if (value === undefined) return key;
  if (!params) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, k: string) => {
    return params[k] !== undefined ? String(params[k]) : `{{${k}}}`;
  });
}
