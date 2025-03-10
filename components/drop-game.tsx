"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Mic, Disc, Bomb, X, Play, Trophy, Clock, Target, Award, CheckCircle } from "lucide-react"
import type { GameState } from "@/hooks/useGameState"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

interface DropGameProps {
  gameState: GameState
  onClose: () => void
}

interface FallingItem {
  id: number
  type: "mic" | "disc" | "bomb" | "special"
  x: number
  y: number
  speed: number
  rotation: number
  scale: number
  animationDelay?: number
}

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
}

export function DropGame({ gameState, onClose }: DropGameProps) {
  const [gameStatus, setGameStatus] = useState<"initial" | "playing" | "gameOver">("initial")
  const [items, setItems] = useState<FallingItem[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const [clickEffects, setClickEffects] = useState<{ id: number; x: number; y: number; type: string; points?: number }[]>([])
  const [spawnRate, setSpawnRate] = useState(600) // Slower spawn rate
  const [level, setLevel] = useState(1)
  const [multiplier, setMultiplier] = useState(1)
  const [showMultiplierEffect, setShowMultiplierEffect] = useState(false)
  const [showLevelUpEffect, setShowLevelUpEffect] = useState(false)
  const [achievements, setAchievements] = useState({
    score5000: false,
    level3: false
  })
  const [particles, setParticles] = useState<Particle[]>([])

  const canPlay = useCallback(() => {
    return Date.now() - gameState.lastDropGameTimestamp >= 2 * 60 * 60 * 1000
  }, [gameState.lastDropGameTimestamp])

  // Create background particles
  useEffect(() => {
    if (gameStatus === "playing") {
      const createParticles = () => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < 50; i++) {
          newParticles.push({
            id: Date.now() + i,
            x: Math.random() * 100, // % of screen width
            y: Math.random() * 100, // % of screen height
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.1,
            speedY: (Math.random() - 0.5) * 0.1,
            opacity: Math.random() * 0.5 + 0.2
          });
        }
        setParticles(newParticles);
      };
      
      createParticles();
      
      const particleInterval = setInterval(() => {
        setParticles(prev => {
          return prev.map(p => ({
            ...p,
            x: (p.x + p.speedX + 100) % 100, // Wrap around screen
            y: (p.y + p.speedY + 100) % 100, // Wrap around screen
            opacity: p.opacity > 0.8 ? 0.5 : p.opacity + 0.01
          }));
        });
      }, 50);
      
      return () => clearInterval(particleInterval);
    }
  }, [gameStatus]);

  useEffect(() => {
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

      // Adaptive difficulty
      const difficultyAdjuster = setInterval(() => {
        if (score > 800 * level && level < 5) {
          setLevel(prev => prev + 1)
          setSpawnRate(prev => Math.max(300, prev - 50))
          setShowLevelUpEffect(true)
          setTimeout(() => setShowLevelUpEffect(false), 2000)
        }
      }, 5000)

      // Item generator with animation delays
      const itemSpawner = setInterval(() => {
        if (gameAreaRef.current) {
          const width = gameAreaRef.current.offsetWidth
          const itemType = generateItemType(level)
          const newItem: FallingItem = {
            id: Date.now(),
            type: itemType,
            x: Math.random() * (width - 60),
            y: -60,
            speed: Math.random() * (4 + level / 2) + 3,
            rotation: Math.random() * 360,
            scale: itemType === "bomb" ? 1.1 : 1.0,
            animationDelay: Math.random() * 0.5 // Random animation delay for more natural movement
          }
          setItems((prev) => [...prev, newItem])
        }
      }, spawnRate)

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

      return () => {
        clearInterval(timer)
        clearInterval(itemSpawner)
        clearInterval(mover)
        clearInterval(difficultyAdjuster)
        document.body.style.overflow = ""
      }
    }
  }, [gameStatus, score, level, spawnRate])

  // Function to determine item type based on level
  const generateItemType = (currentLevel: number): "mic" | "disc" | "bomb" => {
    // Increased bomb chance and disc chance for higher difficulty
    const bombChance = 0.08 + (currentLevel * 0.04);
    const discChance = 0.25 + (currentLevel * 0.02);
    
    const rand = Math.random();
    
    if (rand < bombChance) return "bomb";
    if (rand < bombChance + discChance) return "disc";
    return "mic";
  }

  const handleStart = useCallback(() => {
    if (canPlay()) {
      setGameStatus("playing")
      setScore(0)
      setTimeLeft(60)
      setItems([])
      setMultiplier(1)
      setLevel(1)
      setSpawnRate(600)
      gameState.setLastDropGameTimestamp(Date.now())
      setAchievements({
        score5000: false,
        level3: false
      })
    }
  }, [canPlay, gameState])

  const handleCatch = useCallback(
    (item: FallingItem) => {
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
        // Increased bomb penalty - ensure it's an integer
        const penalty = Math.min(700, Math.floor(score * 0.2));
        setScore(prev => Math.max(0, prev - penalty));
        setMultiplier(1)
        
        // Visual feedback
        setClickEffects(prev => [...prev, {
          id: Date.now(),
          x: item.x,
          y: item.y - 30,
          type: "penalty",
          points: -Math.floor(penalty)
        }])
      } else {
        // Reduced point values - all integers
        let itemPoints = 0;
        if (item.type === "mic") {
          itemPoints = 5; // Reduced from 10
        } else if (item.type === "disc") {
          itemPoints = 15; // Reduced from 25
        } else if (item.type === "special") {
          itemPoints = 50;
        }
        
        const totalPoints = Math.floor(itemPoints * multiplier);
        
        setScore((prev) => prev + totalPoints)
        
        // Visual feedback for points gained
        setClickEffects(prev => [...prev, {
          id: Date.now(),
          x: item.x,
          y: item.y - 30,
          type: "points",
          points: totalPoints
        }])
      }
      
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    },
    [multiplier, score]
  )

  // Reduced reward ratio: now 8 $KNYE per point instead of 10
  const earnedCoins = Math.floor(score * 8)

  // Start Game Modal (Enhanced with better visuals)
  const StartGameModal = () => (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-secondary border-none">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Play className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-primary">Drop Game</CardTitle>
          <CardDescription>
            Catch microphones and discs to earn $KNYE. Avoid bombs!
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 pb-6">
          <div className="bg-accent rounded-lg p-4 mb-6">
            <div className="text-sm font-medium text-foreground mb-2">How to play:</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="bg-primary/20 p-1 rounded w-6 h-6 flex items-center justify-center mt-0.5 shrink-0">
                  <Mic className="w-4 h-4 text-primary" />
                </div>
                <span>Tap microphones for 5 points</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-primary/20 p-1 rounded w-6 h-6 flex items-center justify-center mt-0.5 shrink-0">
                  <Disc className="w-4 h-4 text-primary" />
                </div>
                <span>Tap discs for 15 points</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-destructive/20 p-1 rounded w-6 h-6 flex items-center justify-center mt-0.5 shrink-0">
                  <Bomb className="w-4 h-4 text-destructive" />
                </div>
                <span>Avoid bombs or lose points</span>
              </li>
            </ul>
          </div>
          <Button 
            onClick={handleStart} 
            className="w-full text-lg py-6 bg-primary text-primary-foreground hover:bg-primary/90" 
            disabled={!canPlay()}
          >
            {canPlay() ? "Start Game" : "Cooldown Active"}
          </Button>
          {!canPlay() && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 inline-block mr-1 mb-0.5" />
              Next game available in:{" "}
              {formatTimeLeft(gameState.lastDropGameTimestamp + 2 * 60 * 60 * 1000 - Date.now())}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0 justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  )

  // Game Over Modal (Enhanced with better visuals)
  const GameOverModal = () => (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-secondary border-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <CardHeader className="text-center relative z-10">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-primary">Game Results</CardTitle>
          <CardDescription>
            Good job! You've completed the drop game.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 relative z-10">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-accent p-4 rounded-lg text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <p className="text-sm text-muted-foreground mb-1 relative z-10">Score</p>
              <p className="text-2xl font-bold text-primary relative z-10">{score}</p>
            </div>
            <div className="bg-accent p-4 rounded-lg text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <p className="text-sm text-muted-foreground mb-1 relative z-10">Level</p>
              <p className="text-2xl font-bold text-primary relative z-10">{level}</p>
            </div>
            <div className="bg-accent p-4 rounded-lg text-center col-span-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <p className="text-sm text-muted-foreground mb-1 relative z-10">Reward</p>
              <p className="text-2xl font-bold text-primary relative z-10">{earnedCoins} $KNYE</p>
            </div>
          </div>
          
          {(achievements.score5000 || achievements.level3) && (
            <div className="bg-accent p-4 rounded-lg mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="flex items-center mb-2 relative z-10">
                <Award className="w-5 h-5 text-primary mr-2" />
                <span className="font-medium text-foreground">Achievements Unlocked!</span>
              </div>
              <div className="space-y-2 text-sm relative z-10">
                {achievements.score5000 && (
                  <div className="flex items-center text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                    High Roller (5,000+ score)
                  </div>
                )}
                {achievements.level3 && (
                  <div className="flex items-center text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                    Level Master (Reached level 3)
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-border pt-4 relative z-10">
          <Button 
            onClick={handleStart} 
            variant="outline"
            disabled={!canPlay()}
            className="flex-1 mr-2"
          >
            Play Again
          </Button>
          <Button
            onClick={() => {
              gameState.addCoins(earnedCoins)
              onClose()
            }}
            className="flex-1 ml-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Claim Reward
          </Button>
        </CardFooter>
      </Card>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute top-4 right-4 z-50">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {gameStatus === "initial" && <StartGameModal />}
        {gameStatus === "gameOver" && <GameOverModal />}
      </AnimatePresence>

      {gameStatus === "playing" && (
        <motion.div
          ref={gameAreaRef}
          className="w-full h-full bg-secondary relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Improved background with particles */}
          {particles.map(particle => (
            <div 
              key={particle.id}
              className="absolute rounded-full bg-white pointer-events-none"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                opacity: particle.opacity,
                boxShadow: `0 0 ${particle.size * 2}px rgba(255,255,255,0.5)`
              }}
            />
          ))}
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-background/30 pointer-events-none" />
          
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-background/20 backdrop-blur-sm z-10">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              <span className="text-lg text-foreground font-bold">{timeLeft}s</span>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-lg text-foreground font-bold">Score: {score}</span>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground">Level {level}</span>
                {multiplier > 1 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    x{multiplier}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" />
              <span className="text-lg text-foreground">Level {level}</span>
            </div>
          </div>
          
          {/* Show visual effects for special events */}
          <AnimatePresence>
            {showMultiplierEffect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.5 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
              >
                <span className="text-4xl font-bold text-primary">x{multiplier}</span>
                <span className="text-xl text-foreground">MULTIPLIER!</span>
              </motion.div>
            )}
            
            {showLevelUpEffect && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
              >
                <span className="text-3xl font-bold text-primary">LEVEL UP!</span>
                <span className="text-xl text-foreground">Level {level}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                className="absolute cursor-pointer drop-shadow-lg"
                initial={{ 
                  x: item.x, 
                  y: -60, 
                  rotate: 0, 
                  scale: item.scale || 1,
                  opacity: 0 
                }}
                animate={{ 
                  y: item.y, 
                  rotate: item.rotation,
                  opacity: 1 
                }}
                transition={{ 
                  opacity: { duration: 0.3 },
                  delay: item.animationDelay || 0
                }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={() => handleCatch(item)}
              >
                {item.type === "mic" && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary rounded-full opacity-10 transform scale-110 animate-pulse" />
                    <Mic className="w-14 h-14 text-primary drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                  </div>
                )}
                {item.type === "disc" && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary rounded-full opacity-10 transform scale-110 animate-pulse" />
                    <Disc className="w-14 h-14 text-primary drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                  </div>
                )}
                {item.type === "bomb" && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-destructive rounded-full opacity-10 transform scale-110 animate-pulse" />
                    <Bomb className="w-14 h-14 text-destructive drop-shadow-[0_0_10px_rgba(255,0,0,0.3)]" />
                  </div>
                )}
                {item.type === "special" && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-primary rounded-full opacity-20 transform scale-125 animate-pulse" />
                    <Award className="w-16 h-16 text-primary animate-pulse-glow drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          <AnimatePresence>
            {clickEffects.map((effect) => (
              <motion.div
                key={effect.id}
                className="absolute pointer-events-none"
                initial={{ x: effect.x, y: effect.y, scale: 1, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0, y: effect.y - 50 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                {effect.type === "bomb" ? (
                  <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,0,0,0.5)]">
                    <Bomb className="w-8 h-8 text-white" />
                  </div>
                ) : effect.type === "special" ? (
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                    <Award className="w-8 h-8 text-black" />
                  </div>
                ) : effect.type === "points" ? (
                  <div className="text-xl font-bold text-primary shadow-[0_0_10px_rgba(0,0,0,0.5)]">+{effect.points}</div>
                ) : effect.type === "penalty" ? (
                  <div className="text-xl font-bold text-destructive shadow-[0_0_10px_rgba(0,0,0,0.5)]">{effect.points}</div>
                ) : effect.type === "achievement" ? (
                  <div className="text-xl font-bold text-primary bg-black/30 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                    +{effect.points} BONUS!
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                    {effect.type === "mic" ? (
                      <Mic className="w-8 h-8 text-black" />
                    ) : (
                      <Disc className="w-8 h-8 text-black" />
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