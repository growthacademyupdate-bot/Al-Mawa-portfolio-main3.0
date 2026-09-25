"use client";

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';
import enMessages from '../../../messages/en.json';
import { getCurrentLocale, DEFAULT_LOCALE, type SupportedLocale } from '../../utils/locale-utils';

interface IntlProviderProps {
  children: ReactNode;
}

export function IntlProvider({ children }: IntlProviderProps) {
  const [locale, setLocale] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [messages, setMessages] = useState<Record<string, unknown>>(enMessages);
 

  useEffect(() => {
    // mark client-mounted (previously used isClient state removed)
    
    // Get locale from cookie, ensuring it defaults to English
    const cookieLocale = getCurrentLocale();
    
    if (cookieLocale !== locale) {
      setLocale(cookieLocale);
      
      // Load messages for the locale
      import(`../../../messages/${cookieLocale}.json`)
        .then((module) => setMessages(module.default))
        .catch(() => {
          // Fallback to English if locale file not found
          setMessages(enMessages);
        });
    }
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}
