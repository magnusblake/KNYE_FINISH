"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Disc3, ZapIcon, Gamepad2, Battery, TrendingUp, Clock } from "lucide-react"
import type { GameState } from "@/hooks/useGameState"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { DropGame } from "./drop-game"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins } from "lucide-react"

interface ClickerViewProps {
  gameState: GameState
}

export function ClickerView({ gameState }: ClickerViewProps) {
  const [clickEffect, setClickEffect] = useState<{ id: number; x: number; y: number; amount: number }[]>([])
  const [isDropGameOpen, setIsDropGameOpen] = useState(false)
  const [timeUntilNextGame, setTimeUntilNextGame] = useState<string | null>(null)
  const [canClick, setCanClick] = useState(true)
  const [clickStreak, setClickStreak] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [comboMultiplier, setComboMultiplier] = useState(1)
  const [showComboText, setShowComboText] = useState(false)
  const clickerRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    if (canClick && gameState.energy >= 1) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const now = Date.now()
      const timeSinceLastClick = now - lastClickTime
      
      // Combo system - fast consecutive clicks increase multiplier
      if (timeSinceLastClick < 500) {
        setClickStreak(prev => {
          const newStreak = prev + 1;
          // Every 5 consecutive clicks increases the multiplier
          if (newStreak % 5 === 0 && newStreak <= 25) {
            setComboMultiplier(1 + (newStreak / 25));
            setShowComboText(true);
            setTimeout(() => setShowComboText(false), 1000);
          }
          return newStreak;
        });
      } else {
        setClickStreak(1);
        setComboMultiplier(1);
      }
      
      setLastClickTime(now);

      // Calculate earned coins with combo multiplier
      const earnedCoins = gameState.coinsPerClick * comboMultiplier;
      
      const newEffect = { id: Date.now(), x, y, amount: earnedCoins }
      setClickEffect((prev) => [...prev, newEffect])

      setTimeout(() => {
        setClickEffect((prev) => prev.filter((effect) => effect.id !== newEffect.id))
      }, 1000)

      gameState.addCoins(earnedCoins)
      gameState.totalClicks += 1 // Directly increment total clicks
      setCanClick(false)
      gameState.useEnergy(1) // Use 1 energy per click
      
      // Visual feedback - make the clicker element pulse
      if (clickerRef.current) {
        clickerRef.current.classList.add('scale-95');
        setTimeout(() => {
          if (clickerRef.current) clickerRef.current.classList.remove('scale-95');
        }, 100);
      }
      
      setTimeout(() => {
        setCanClick(true)
      }, 200)
    }
  }

  useEffect(() => {
    const updateTimeUntilNextGame = () => {
      const timeSinceLastGame = Date.now() - gameState.lastDropGameTimestamp
      const timeLeft = Math.max(0, 2 * 60 * 60 * 1000 - timeSinceLastGame)

      if (timeLeft > 0) {
        setTimeUntilNextGame(formatTimeLeft(timeLeft))
      } else {
        setTimeUntilNextGame(null)
      }
    }

    updateTimeUntilNextGame()
    const interval = setInterval(updateTimeUntilNextGame, 1000)

    return () => clearInterval(interval)
  }, [gameState.lastDropGameTimestamp])

  return (
    <div className="flex flex-col items-center justify-center py-8 relative">
      {showComboText && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-44 text-primary font-bold text-xl"
        >
          COMBO x{comboMultiplier.toFixed(1)}!
        </motion.div>
      )}

      <div className="relative mb-8">
        <motion.div
          ref={clickerRef}
          className="relative z-10 w-48 h-48 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg cursor-pointer overflow-hidden transition-transform duration-100"
          whileHover={{ scale: 1.05 }}
          onClick={handleClick}
        >
          <Image
            src="/placeholder.svg?height=180&width=180"
            alt="Kanye West"
            width={180}
            height={180}
            className="w-full h-full object-cover rounded-full"
          />
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            whileTap={{ opacity: 0.3 }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>

        <AnimatePresence>
          {clickEffect.map((effect) => (
            <motion.div
              key={effect.id}
              initial={{ opacity: 1, scale: 0.8, x: effect.x - 12, y: effect.y - 12 }}
              animate={{ opacity: 0, scale: 1.5, y: effect.y - 50 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute text-primary font-bold pointer-events-none z-20"
            >
              +{effect.amount.toFixed(1)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary p-3 rounded-lg">
            <div className="flex items-center">
              <ZapIcon className="w-5 h-5 mr-2 text-primary" />
              <span className="text-muted-foreground">Per Click</span>
            </div>
            <span className="text-xl font-bold text-primary">{gameState.coinsPerClick.toFixed(2)} $KNYE</span>
          </div>
          <div className="bg-secondary p-3 rounded-lg">
            <div className="flex items-center">
              <Disc3 className="w-5 h-5 mr-2 text-primary" />
              <span className="text-muted-foreground">Per Second</span>
            </div>
            <span className="text-xl font-bold text-primary">{gameState.coinsPerSecond.toFixed(2)} $KNYE</span>
          </div>
          <div className="bg-secondary p-3 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              <span className="text-muted-foreground">Clicked</span>
            </div>
            <span className="text-xl font-bold text-primary">{gameState.totalClicks.toLocaleString()}</span>
          </div>
          <div className="bg-secondary p-3 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              <span className="text-muted-foreground">Combo</span>
            </div>
            <span className="text-xl font-bold text-primary">x{comboMultiplier.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gamepad2 className="w-6 h-6 mr-2 text-primary" />
            Drop Game
          </CardTitle>
          <CardDescription>Catch microphones and discs to earn extra $KNYE!</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              if (!isDropGameOpen) {
                setIsDropGameOpen(true)
              }
            }}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!!timeUntilNextGame || isDropGameOpen}
          >
            {timeUntilNextGame ? `Next game in ${timeUntilNextGame}` : "Play Drop Game"}
          </Button>

          {isDropGameOpen && (
            <DropGame
              gameState={gameState}
              onClose={() => {
                setIsDropGameOpen(false)
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatTimeLeft(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${hours}h ${minutes}m ${seconds}s`
}