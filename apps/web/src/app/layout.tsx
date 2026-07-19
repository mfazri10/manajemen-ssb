import type { Metadata } from "next";
import { ApolloWrapper } from "../components/ApolloWrapper";
import "./globals.css";
import { Inter, Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";

const montserratHeading = Montserrat({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "SaaS Sport Management",
  description: "SSB Management Platform",
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
        <ApolloWrapper>
          <MainLayout>
            {children}
          </MainLayout>
          <Toaster />
        </ApolloWrapper>
      </body>
    </html>
  );
}
