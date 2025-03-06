"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Gamepad2, Globe, MessageSquare } from "lucide-react"
import type { GameState } from "@/hooks/useGameState"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { DropGame } from "./drop-game"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface ClickerViewProps {
  gameState: GameState
}

export function ClickerView({ gameState }: ClickerViewProps) {
  const [clickEffect, setClickEffect] = useState<{ id: number; x: number; y: number; amount: number }[]>([])
  const [isDropGameOpen, setIsDropGameOpen] = useState(false)
  const [timeUntilNextGame, setTimeUntilNextGame] = useState<string | null>(null)
  const [canClick, setCanClick] = useState(true)
  const clickerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [coinSize, setCoinSize] = useState(180) // Default size

  // Resize the coin based on window size
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        // Calculate appropriate size based on container height
        const calculatedSize = Math.min(180, containerHeight * 0.4);
        setCoinSize(Math.max(120, calculatedSize)); // Min size of 120px
      }
    };

    handleResize(); // Calculate on initial render
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (canClick && gameState.energy >= 1) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Calculate earned coins (integer values)
      const earnedCoins = Math.floor(gameState.coinsPerClick);
      
      // Position the effect relative to click position
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
    <div ref={containerRef} className="flex flex-col items-center justify-start h-full">
      <div className="relative mb-6 mt-4">
        <motion.div
          ref={clickerRef}
          className="relative z-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg cursor-pointer overflow-hidden transition-transform duration-100"
          style={{ width: `${coinSize}px`, height: `${coinSize}px` }}
          whileHover={{ scale: 1.05 }}
          onClick={handleClick}
        >
          <Image
            src="/knye.jpg"
            alt="Kanye West"
            width={coinSize}
            height={coinSize}
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
              +{effect.amount}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Card className="w-full max-w-md mb-6">
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
              if (!isDropGameOpen && !timeUntilNextGame) {
                setIsDropGameOpen(true)
              }
            }}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!!timeUntilNextGame || isDropGameOpen}
          >
            {timeUntilNextGame ? `Next game in ${timeUntilNextGame}` : "Play Drop Game"}
          </Button>
        </CardContent>
      </Card>

      {/* Social links */}
      <div className="mt-auto mb-6 flex justify-center gap-8">
        <Link
          href="https://example.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center text-primary hover:text-primary/80"
        >
          <Globe className="w-6 h-6 mb-2" />
          <span className="text-sm">Website</span>
        </Link>
        
        <Link
          href="https://t.me/example"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center text-primary hover:text-primary/80"
        >
          <MessageSquare className="w-6 h-6 mb-2" />
          <span className="text-sm">Telegram</span>
        </Link>
      </div>

      {/* Drop Game Modal */}
      <AnimatePresence>
        {isDropGameOpen && (
          <DropGame
            gameState={gameState}
            onClose={() => setIsDropGameOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function formatTimeLeft(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${hours}h ${minutes}m ${seconds}s`
}