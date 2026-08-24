'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Wrapper next-themes untuk dark mode.
 * Token `.dark` sudah didefinisikan di globals.css — provider inilah yang
 * mengaktifkan class tersebut (light/dark/system).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
