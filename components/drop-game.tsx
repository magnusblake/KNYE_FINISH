"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Mic, Disc, Bomb, X, Play, Trophy, Battery } from "lucide-react"
import type { GameState } from "@/hooks/useGameState"

interface DropGameProps {
  gameState: GameState
  onClose: () => void
}

interface FallingItem {
  id: number
  type: "mic" | "disc" | "bomb"
  x: number
  y: number
  speed: number
  rotation: number
}

export function DropGame({ gameState, onClose }: DropGameProps) {
  const [gameStatus, setGameStatus] = useState<"initial" | "playing" | "gameOver">("initial")
  const [items, setItems] = useState<FallingItem[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const [combo, setCombo] = useState(0)
  const [lastCatchTime, setLastCatchTime] = useState(0)
  const [clickEffects, setClickEffects] = useState<{ id: number; x: number; y: number; type: string }[]>([])
  const [energy, setEnergy] = useState(gameState.energy)

  const canPlay = useCallback(() => {
    return Date.now() - gameState.lastDropGameTimestamp >= 2 * 60 * 60 * 1000
  }, [gameState.lastDropGameTimestamp])

  useEffect(() => {
    console.log("DropGame mounted, gameStatus:", gameStatus)
    return () => {
      console.log("DropGame unmounted")
    }
  }, [gameStatus])

  useEffect(() => {
    console.log("GameStatus changed:", gameStatus)
    if (gameStatus === "playing") {
      document.body.style.overflow = "hidden"
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameStatus("gameOver")
            document.body.style.overflow = ""
            return 0
          }
          return prev - 1
        })
      }, 1000)

      const itemSpawner = setInterval(() => {
        if (gameAreaRef.current) {
          const width = gameAreaRef.current.offsetWidth
          const newItem: FallingItem = {
            id: Date.now(),
            type: Math.random() < 0.15 ? "bomb" : Math.random() < 0.7 ? "mic" : "disc",
            x: Math.random() * (width - 40),
            y: -40,
            speed: Math.random() * 3 + 3,
            rotation: Math.random() * 360,
          }
          setItems((prev) => [...prev, newItem])
        }
      }, 500)

      const mover = setInterval(() => {
        setItems((prev) =>
          prev
            .map((item) => ({
              ...item,
              y: item.y + item.speed,
              rotation: item.rotation + item.speed * 2,
            }))
            .filter((item) => item.y < (gameAreaRef.current?.offsetHeight || 0)),
        )
      }, 16)

      const energyTimer = setInterval(() => {
        setEnergy((prev) => Math.min(prev + gameState.energyRegenRate, gameState.maxEnergy))
      }, 1000)

      return () => {
        clearInterval(timer)
        clearInterval(itemSpawner)
        clearInterval(mover)
        clearInterval(energyTimer)
        document.body.style.overflow = ""
      }
    }
  }, [gameStatus, gameState.energyRegenRate, gameState.maxEnergy])

  const handleStart = useCallback(() => {
    console.log("Attempting to start game, canPlay:", canPlay())
    if (canPlay()) {
      console.log("Starting game...")
      setGameStatus("playing")
      setScore(0)
      setTimeLeft(60)
      setItems([])
      setCombo(0)
      gameState.setLastDropGameTimestamp(Date.now())
    } else {
      console.log("Cannot start game, cooldown active")
    }
  }, [canPlay, gameState])

  const handleCatch = useCallback(
    (item: FallingItem) => {
      if (energy >= 5) {
        setEnergy((prev) => prev - 5)
        const clickEffect = {
          id: Date.now(),
          x: item.x,
          y: item.y,
          type: item.type,
        }
        setClickEffects((prev) => [...prev, clickEffect])
        setTimeout(() => {
          setClickEffects((prev) => prev.filter((effect) => effect.id !== clickEffect.id))
        }, 500)

        if (item.type === "bomb") {
          setGameStatus("gameOver")
          setCombo(0)
        } else {
          const now = Date.now()
          if (now - lastCatchTime < 1000) {
            setCombo((prev) => prev + 1)
          } else {
            setCombo(1)
          }
          setLastCatchTime(now)

          const itemScore = item.type === "mic" ? 1 : 2
          const comboBonus = Math.min(combo, 5)
          setScore((prev) => prev + itemScore * comboBonus)
          setItems((prev) => prev.filter((i) => i.id !== item.id))
        }
      }
    },
    [combo, lastCatchTime, energy],
  )

  const earnedCoins = score * 10

  const GameCard = React.memo(({ children }: { children: React.ReactNode }) => (
    <motion.div
      className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-secondary p-8 rounded-lg text-center max-w-md w-full"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  ))

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute top-4 right-4 z-50">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      <AnimatePresence>
        {gameStatus !== "playing" && (
          <GameCard>
            {gameStatus === "initial" ? (
              <>
                <Play className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-primary mb-4">Drop Game</h2>
                <p className="text-muted-foreground mb-6">
                  Catch microphones and discs to earn $KNYE. Avoid the bombs!
                </p>
                <Button onClick={handleStart} className="w-full text-lg px-8 py-4" disabled={!canPlay()}>
                  {canPlay() ? "Start Game" : "Cooldown Active"}
                </Button>
                {!canPlay() && (
                  <p className="text-muted-foreground mt-4">
                    Next game available in:{" "}
                    {formatTimeLeft(gameState.lastDropGameTimestamp + 2 * 60 * 60 * 1000 - Date.now())}
                  </p>
                )}
              </>
            ) : (
              <>
                <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-primary mb-4">Game Over!</h2>
                <p className="text-xl text-muted-foreground mb-2">Your score: {score}</p>
                <p className="text-xl text-muted-foreground mb-6">You earned: {earnedCoins} $KNYE</p>
                <div className="flex justify-center gap-4">
                  <Button onClick={handleStart} className="text-lg px-6 py-3" disabled={!canPlay()}>
                    Play Again
                  </Button>
                  <Button
                    onClick={() => {
                      gameState.addCoins(earnedCoins)
                      onClose()
                    }}
                    className="text-lg px-6 py-3"
                  >
                    Claim Reward
                  </Button>
                </div>
              </>
            )}
          </GameCard>
        )}
      </AnimatePresence>

      {gameStatus === "playing" && (
        <motion.div
          ref={gameAreaRef}
          className="w-full h-full bg-secondary relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute top-4 left-4 text-lg text-white font-bold">Time: {timeLeft}s</div>
          <div className="absolute top-4 right-4 text-lg text-white font-bold flex items-center">
            <Battery className="w-6 h-6 mr-2" />
            <span>
              {Math.floor(energy)}/{gameState.maxEnergy}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 text-lg text-white font-bold">Combo: x{Math.min(combo, 5)}</div>
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                className="absolute cursor-pointer"
                initial={{ x: item.x, y: -40, rotate: 0 }}
                animate={{ y: item.y, rotate: item.rotation }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0 }}
                onClick={() => handleCatch(item)}
              >
                {item.type === "mic" && <Mic className="w-12 h-12 text-white" />}
                {item.type === "disc" && <Disc className="w-12 h-12 text-white" />}
                {item.type === "bomb" && <Bomb className="w-12 h-12 text-white" />}
              </motion.div>
            ))}
          </AnimatePresence>
          <AnimatePresence>
            {clickEffects.map((effect) => (
              <motion.div
                key={effect.id}
                className="absolute pointer-events-none"
                initial={{ x: effect.x, y: effect.y, scale: 1, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {effect.type === "bomb" ? (
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                    <Bomb className="w-8 h-8 text-white" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    {effect.type === "mic" ? (
                      <Mic className="w-8 h-8 text-white" />
                    ) : (
                      <Disc className="w-8 h-8 text-white" />
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

function formatTimeLeft(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${hours}h ${minutes}m ${seconds}s`
}

