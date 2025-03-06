"use client"

import { useState, useEffect } from "react"
import { Coins, Disc3, Battery, Sparkles, Rocket, ZapIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { GameState } from "@/hooks/useGameState"
import { AnimatePresence, motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface GameHeaderProps {
  gameState: GameState
}

export function GameHeader({ gameState }: GameHeaderProps) {
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [previousLevel, setPreviousLevel] = useState(gameState.level)
  
  // Calculate XP progress
  const xpForCurrentLevel = gameState.level * 500
  const xpProgress = (gameState.experience / xpForCurrentLevel) * 100
  
  // Calculate energy percentage
  const energyPercentage = (gameState.energy / gameState.maxEnergy) * 100
  
  // Format large numbers with K, M abbreviations
  const formatLargeNumber = (num: number): string => {
    if (num >= 1000000) {
      return Math.floor(num / 1000000) + 'M';
    } else if (num >= 1000) {
      return Math.floor(num / 1000) + 'K';
    } else {
      return Math.floor(num).toString();
    }
  }
  
  useEffect(() => {
    // Check for level up
    if (gameState.level > previousLevel) {
      setShowLevelUp(true)
      setTimeout(() => setShowLevelUp(false), 3000)
    }
    setPreviousLevel(gameState.level)
  }, [gameState.level, previousLevel])

  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 py-3">
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">$KNYE</span>
              <div className="bg-secondary px-3 py-1 rounded-full flex items-center">
                <Coins className="w-4 h-4 text-primary mr-2" />
                <span className="text-white font-medium text-sm">{formatLargeNumber(gameState.coins)}</span>
              </div>
              
              {gameState.prestigeLevel > 0 && (
                <div className="bg-primary px-2 py-1 rounded-full flex items-center">
                  <Sparkles className="w-3 h-3 text-black mr-1" />
                  <span className="text-black font-bold text-xs">{gameState.prestigeLevel}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <ZapIcon className="w-4 h-4 mr-1" />
                <span>{gameState.coinsPerClick}/click</span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Disc3 className="w-4 h-4 mr-1" />
                <span>{gameState.coinsPerSecond}/s</span>
              </div>
            </div>
          </div>
          
          {/* Changed from side-by-side to stacked layout for progress bars */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <Rocket className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 flex items-center gap-1">
                <Progress value={xpProgress} className="h-2 flex-1 bg-secondary/60" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Lvl {gameState.level} ({gameState.experience}/{xpForCurrentLevel})
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Battery className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 flex items-center gap-1">
                <Progress value={energyPercentage} className="h-2 flex-1 bg-secondary/60" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {Math.floor(gameState.energy)}/{gameState.maxEnergy}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed level up notification to stay within screen boundaries */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            className="fixed left-1/2 top-20 transform -translate-x-1/2 z-50 w-auto px-4 max-w-[90vw]"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 justify-center whitespace-nowrap">
              <Rocket className="w-5 h-5" />
              <span className="font-bold text-sm">Level Up! Level {gameState.level}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}