import type React from "react"
import "@/app/globals.css"
import { Space_Grotesk } from "next/font/google"
import type { Metadata } from "next"
import { cn } from "@/lib/utils"
import Script from "next/script"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "$KNYE — Kanye West Mining Game",
  description: "Mine $KNYE coins with this Kanye West themed clicker game",
  generator: '$KNYE',
  // Add proper viewport settings for mobile
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  // Add theme color for mobile browsers
  themeColor: '#000000',
  // Add icons
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Load Telegram WebApp script with proper async attribute */}
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive"
        />
        {/* Prevent zooming on mobile devices */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={cn(spaceGrotesk.className, "bg-black text-white")}>
        {children}
        {/* Desktop Blocker is now handled in the component itself */}
      </body>
    </html>
  )
}