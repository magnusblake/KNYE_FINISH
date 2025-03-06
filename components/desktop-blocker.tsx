// Create a new file at components/desktop-blocker.tsx
"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { Smartphone, MonitorSmartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function DesktopBlocker() {
  const isMobile = useIsMobile()
  const [showBlocker, setShowBlocker] = useState(false)
  
  // Only show blocker after client-side check to avoid hydration mismatch
  useEffect(() => {
    if (!isMobile) {
      setShowBlocker(true)
    }
  }, [isMobile])
  
  if (!showBlocker) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-8 bg-secondary rounded-xl shadow-xl text-center"
      >
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
              <span>Open this app on your mobile device</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Use the Telegram mobile app if you came from there</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Scan this QR code with your smartphone:</span>
            </li>
          </ul>
        </div>
        
        {/* QR code image could be added here */}
        <div className="border border-border p-6 rounded-lg w-48 h-48 mx-auto mb-6 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">QR Code Here</p>
        </div>
        
        <Button 
          onClick={() => window.location.href = "https://t.me/example"}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Open in Telegram
        </Button>
      </motion.div>
    </div>
  )
}