"use client";

import { useEffect } from "react";
import { useStore, colorSchemes } from "@/store";

export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, glassOpacity } = useStore();

  useEffect(() => {
    const scheme = colorSchemes.find(s => s.id === colorScheme) || colorSchemes[0];
    const root = document.documentElement;
    
    // Set CSS variables
    root.style.setProperty('--color-primary', scheme.colors.primary);
    root.style.setProperty('--color-primary-light', scheme.colors.primaryLight);
    root.style.setProperty('--color-secondary', scheme.colors.secondary);
    root.style.setProperty('--color-accent', scheme.colors.accent);
    root.style.setProperty('--color-glass-rgb', scheme.colors.glass);
    root.style.setProperty('--gradient-from', scheme.colors.gradientFrom);
    root.style.setProperty('--gradient-to', scheme.colors.gradientTo);
    root.style.setProperty('--glass-opacity', (glassOpacity / 100).toString());
  }, [colorScheme, glassOpacity]);

  return <>{children}</>;
}
