import type { Metadata, Viewport } from "next";
import { ApolloWrapper } from "../components/ApolloWrapper";
import { ThemeProvider } from "../components/theme-provider";
import { ErrorBoundary } from "../components/error-boundary";
import { PwaRegister } from "../components/pwa-register";
import "./globals.css";
import { Inter, Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";

const montserratHeading = Montserrat({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "SaaS Sport Management",
  description: "SSB Management Platform",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SSB Garuda",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
};

import { Toaster } from "@/components/ui/sonner";
import MainLayout from "@/components/MainLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans", inter.variable, montserratHeading.variable)} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider>
          <ApolloWrapper>
            <ErrorBoundary>
              <MainLayout>
                {children}
              </MainLayout>
            </ErrorBoundary>
            <Toaster />
            <PwaRegister />
          </ApolloWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
