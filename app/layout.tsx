import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MaxPlayer IPTV Dashboard",
  description: "Gestiona tu suscripción de IPTV",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suprimir error de ResizeObserver
              const debounce = (fn, delay) => {
                let timeoutId;
                return (...args) => {
                  clearTimeout(timeoutId);
                  timeoutId = setTimeout(() => fn(...args), delay);
                };
              };

              window.addEventListener('error', (e) => {
                if (e.message && (
                  e.message.includes('ResizeObserver') ||
                  e.message === 'ResizeObserver loop completed with undelivered notifications.'
                )) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                  return false;
                }
              });

              // También interceptar a nivel de consola
              const originalError = console.error;
              console.error = function(...args) {
                if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
                  return;
                }
                originalError.apply(console, args);
              };
            `,
          }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
