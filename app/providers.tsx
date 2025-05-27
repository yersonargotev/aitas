"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type * as React from "react";

export function Providers({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider {...props}>
            <NuqsAdapter>
                {children}
            </NuqsAdapter>
        </NextThemesProvider>
    );
}
