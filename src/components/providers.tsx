"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { ColorSchemeProvider } from "./theme/color-scheme-provider";
import { DataProvider } from "./data-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ColorSchemeProvider>
        <DataProvider>
          {children}
        </DataProvider>
      </ColorSchemeProvider>
    </ThemeProvider>
  );
}
