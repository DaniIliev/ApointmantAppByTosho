import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const metadata: Metadata = {
  title: "AppointDI",
  description: "Created with v0",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    var d = document.documentElement;
    var t = localStorage.getItem('theme');
    if (t === 'dark') d.classList.add('dark');
    else d.classList.remove('dark');

    var p = localStorage.getItem('selectedPalette');
    var allowed = ['theme-blue','theme-green','theme-purple','theme-red'];
    if (p && allowed.indexOf(p) !== -1) {
      d.classList.add(p);
    }
  } catch (e) { }
})();`,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            <ThemeProvider>
              <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
            </ThemeProvider>
          </NextThemesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
