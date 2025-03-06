"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function LoadingScreen() {
  const [loadingText, setLoadingText] = useState("Loading")
  
  // Animate loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText(prev => {
        if (prev === "Loading...") return "Loading"
        if (prev === "Loading..") return "Loading..."
        if (prev === "Loading.") return "Loading.."
        return "Loading."
      })
    }, 500)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-2 border-t-primary border-r-primary/10 border-b-primary/30 border-l-primary/70 rounded-full mb-6"
      />
      
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold text-primary mb-2">$KNYE</h2>
        <p className="text-muted-foreground">{loadingText}</p>
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-muted-foreground">
        <p>Syncing...</p>
      </div>
    </div>
  )
}