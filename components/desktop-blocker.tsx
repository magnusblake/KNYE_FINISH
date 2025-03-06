"use client"

import { useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTelegram } from "@/hooks/useTelegram"
import { Smartphone, MonitorSmartphone, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import QRCode from "qrcode.react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function DesktopBlocker() {
  const { isReady, tg } = useTelegram()
  const isMobile = useIsMobile()
  const [showBlocker, setShowBlocker] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // URL to your bot - replace with actual bot link
  const botLink = "https://t.me/your_bot_username"
  
  useEffect(() => {
    // Only show the component after client-side check to avoid hydration mismatch
    const checkEnvironment = () => {
      // First check if we're in a Telegram WebApp
      const isTelegramWebApp = window.Telegram?.WebApp !== undefined
      
      if (!isTelegramWebApp) {
        setError("This app must be launched from Telegram")
        setShowBlocker(true)
        return
      }
      
      // Check if running on mobile
      if (!isMobile) {
        setError("This app must be used on a mobile device")
        setShowBlocker(true)
        return
      }
      
      // Everything is fine, don't show blocker
      setShowBlocker(false)
    }
    
    // Small delay to ensure Telegram WebApp has time to initialize
    const timeout = setTimeout(checkEnvironment, 500)
    return () => clearTimeout(timeout)
  }, [isMobile, isReady])
  
  // If all conditions are met, render nothing
  if (!showBlocker) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-8 bg-secondary rounded-xl shadow-xl text-center"
      >
        {error === "This app must be launched from Telegram" ? (
          <>
            <AlertCircle className="w-16 h-16 mx-auto mb-6 text-destructive" />
            
            <h1 className="text-2xl font-bold text-primary mb-2">Telegram Required</h1>
            
            <p className="text-muted-foreground mb-6">
              This application must be opened from within the Telegram app.
            </p>
            
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Launch from Telegram</AlertTitle>
              <AlertDescription>
                Please open this bot in your Telegram mobile app to use this application.
              </AlertDescription>
            </Alert>
            
            <div className="p-4 bg-accent rounded-lg mb-6">
              <div className="flex items-center mb-4">
                <Smartphone className="w-5 h-5 text-primary mr-2" />
                <span className="font-medium text-foreground">How to access:</span>
              </div>
              <ol className="text-sm text-muted-foreground text-left space-y-3">
                <li className="flex items-start">
                  <span className="text-primary mr-2">1.</span>
                  <span>Open Telegram on your mobile device</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">2.</span>
                  <span>Scan this QR code or search for our bot</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">3.</span>
                  <span>Start the bot and tap on the game button</span>
                </li>
              </ol>
            </div>
            
            <div className="bg-white p-4 rounded-lg w-48 h-48 mx-auto mb-6 flex items-center justify-center">
              <QRCode value={botLink} size={160} />
            </div>
            
            <Button 
              onClick={() => window.location.href = botLink}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Open in Telegram
            </Button>
          </>
        ) : (
          <>
            <Smartphone className="w-16 h-16 mx-auto mb-6 text-primary" />
            
            <h1 className="text-2xl font-bold text-primary mb-2">Mobile Only Game</h1>
            
            <p className="text-muted-foreground mb-6">
              $KNYE Clicker is designed for mobile devices only. Please open this game on your smartphone or tablet to play.
            </p>
            
            <div className="p-4 bg-accent rounded-lg mb-6">
              <div className="flex items-center mb-2">
                <MonitorSmartphone className="w-5 h-5 text-primary mr-2" />
                <span className="font-medium text-foreground">Ways to Play:</span>
              </div>
              <ul className="text-sm text-muted-foreground text-left space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Open Telegram on your mobile device</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Navigate to our bot</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Scan this QR code with your smartphone:</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg w-48 h-48 mx-auto mb-6 flex items-center justify-center">
              <QRCode value={botLink} size={160} />
            </div>
            
            <Button 
              onClick={() => window.location.href = botLink}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Open in Telegram
            </Button>
          </>
        )}
      </motion.div>
    </div>
  )
}