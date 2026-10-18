import type { Metadata } from "next";
import { Instrument_Sans, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { AppToaster } from "@/components/layout/app-toaster";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { LanguageProvider } from "@/components/layout/language-provider";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "N-ATLaS Language Foundry",
  description:
    "Developer infrastructure and adaptation platform for underserved Nigerian languages on N-ATLaS.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
      className={`h-full antialiased ${instrumentSans.variable} ${geistMono.variable}`}
    >
      <head>
        <meta name="color-scheme" content="dark light" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("n-atlas-theme");var resolved=t==="light"?"light":(t==="dark"?"dark":(t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):"dark"));document.documentElement.setAttribute("data-theme",resolved);document.documentElement.style.colorScheme=resolved;var m=document.querySelector('meta[name="color-scheme"]');if(m)m.content=resolved==="dark"?"dark light":"light dark";}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground selection:bg-accent/20 selection:text-foreground">
        <ThemeProvider>
          <LanguageProvider>
            <AppShell>{children}</AppShell>
            <AppToaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
