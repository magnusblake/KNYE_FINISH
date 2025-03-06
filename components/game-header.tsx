"use client"

import { useState, useEffect } from "react"
import { Coins, Disc3, Battery, Sparkles, Rocket, Globe, MessageSquare } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { GameState } from "@/hooks/useGameState"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface GameHeaderProps {
  gameState: GameState
}

export function GameHeader({ gameState }: GameHeaderProps) {
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [previousLevel, setPreviousLevel] = useState(gameState.level)
  const [hasUnclaimedAchievements, setHasUnclaimedAchievements] = useState(false)
  
  // Calculate XP progress
  const xpForCurrentLevel = gameState.level * 500
  const xpProgress = (gameState.experience / xpForCurrentLevel) * 100
  
  // Calculate energy percentage
  const energyPercentage = (gameState.energy / gameState.maxEnergy) * 100
  
  useEffect(() => {
    // Check for level up
    if (gameState.level > previousLevel) {
      setShowLevelUp(true)
      setTimeout(() => setShowLevelUp(false), 3000)
    }
    setPreviousLevel(gameState.level)
    
    // Check for unclaimed achievements
    const unclaimedAchievements = gameState.achievements.some(a => a.completed && !a.claimed)
    setHasUnclaimedAchievements(unclaimedAchievements)
  }, [gameState.level, gameState.achievements, previousLevel])

  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">$KNYE</span>
              <div className="bg-secondary px-3 py-1 rounded-full flex items-center">
                <Coins className="w-4 h-4 text-primary mr-2" />
                <span className="text-white font-medium text-sm">{Math.floor(gameState.coins).toLocaleString()}</span>
              </div>
              
              {gameState.prestigeLevel > 0 && (
                <div className="bg-primary px-2 py-1 rounded-full flex items-center">
                  <Sparkles className="w-3 h-3 text-black mr-1" />
                  <span className="text-black font-bold text-xs">{gameState.prestigeLevel}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <AnimatePresence>
                {hasUnclaimedAchievements && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs flex items-center"
                  >
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                    </span>
                    Rewards
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Disc3 className="w-4 h-4 mr-1" />
                <span>{gameState.coinsPerSecond.toFixed(1)}/s</span>
              </div>
              
              <Link
                href="https://example.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                <Globe className="w-5 h-5" />
              </Link>
              
              <Link
                href="https://t.me/example"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-1/3">
              <Battery className="w-4 h-4 text-primary shrink-0" />
              <Progress value={energyPercentage} className="h-2 flex-1 bg-secondary/60" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {Math.floor(gameState.energy)}/{gameState.maxEnergy}
              </span>
            </div>
            
            <div className="w-2/3 flex items-center gap-2">
              <div className="flex items-center gap-1 shrink-0">
                <Rocket className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Lvl {gameState.level}</span>
              </div>
              <Progress value={xpProgress} className="h-2 flex-1 bg-secondary/60" />
              <span className="text-xs text-muted-foreground">
                {gameState.experience}/{xpForCurrentLevel}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              <span className="font-bold">Level Up! You reached level {gameState.level}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}