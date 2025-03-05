"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Disc3, ZapIcon, Gamepad2, Battery } from "lucide-react"
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
  const [clickEffect, setClickEffect] = useState<{ id: number; x: number; y: number }[]>([])
  const [isDropGameOpen, setIsDropGameOpen] = useState(false)
  const [timeUntilNextGame, setTimeUntilNextGame] = useState<string | null>(null)
  const [canClick, setCanClick] = useState(true)
  const [energyUsed, setEnergyUsed] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    if (canClick) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newEffect = { id: Date.now(), x, y }
      setClickEffect((prev) => [...prev, newEffect])

      setTimeout(() => {
        setClickEffect((prev) => prev.filter((effect) => effect.id !== newEffect.id))
      }, 1000)

      const earnedCoins = gameState.coinsPerClick
      gameState.addCoins(earnedCoins)
      setCanClick(false)
      setEnergyUsed(true)
      setTimeout(() => {
        setCanClick(true)
        setEnergyUsed(false)
      }, 200)
    }
  }

  useEffect(() => {
    if (energyUsed) {
      gameState.useEnergy(1)
    }
  }, [energyUsed, gameState])

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
      <h1 className="text-4xl font-bold mb-2 text-primary">$KNYE CLICKER</h1>
      <p className="text-muted-foreground mb-8">Tap to earn {gameState.coinsPerClick.toFixed(2)} coins per click</p>

      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-secondary px-3 py-1 rounded-full flex items-center">
          <Coins className="w-4 h-4 text-primary mr-2" />
          <span className="text-white font-medium text-sm">{Math.floor(gameState.coins).toLocaleString()}</span>
        </div>
        <div className="bg-secondary px-3 py-1 rounded-full flex items-center">
          <Battery className="w-4 h-4 text-primary mr-2" />
          <span className="text-white font-medium text-sm">
            {Math.floor(gameState.energy)}/{gameState.maxEnergy}
          </span>
        </div>
      </div>

      <div className="relative mb-8">
        <motion.div
          className="relative z-10 w-48 h-48 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg cursor-pointer overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
              +{gameState.coinsPerClick.toFixed(2)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md space-y-4 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <ZapIcon className="w-6 h-6 mr-2 text-primary" />
            <span className="text-muted-foreground">Per Click</span>
          </div>
          <span className="font-bold text-primary">{gameState.coinsPerClick.toFixed(2)} $KNYE</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Disc3 className="w-6 h-6 mr-2 text-primary" />
            <span className="text-muted-foreground">Per Second</span>
          </div>
          <span className="font-bold text-primary">{gameState.coinsPerSecond.toFixed(2)} $KNYE</span>
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
              setIsDropGameOpen(true)
              console.log("Opening Drop Game")
            }}
            className="w-full"
            disabled={!!timeUntilNextGame}
          >
            {timeUntilNextGame ? `Next game in ${timeUntilNextGame}` : "Play Drop Game"}
          </Button>

          {isDropGameOpen && (
            <DropGame
              gameState={gameState}
              onClose={() => {
                setIsDropGameOpen(false)
                console.log("Closing Drop Game")
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

