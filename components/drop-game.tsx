"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Mic, Disc, Bomb, X, Play, Trophy, Battery, Clock, Target, Award } from "lucide-react"
import type { GameState } from "@/hooks/useGameState"
import { Progress } from "@/components/ui/progress"

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
}

export function DropGame({ gameState, onClose }: DropGameProps) {
  const [gameStatus, setGameStatus] = useState<"initial" | "playing" | "gameOver">("initial")
  const [items, setItems] = useState<FallingItem[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const [combo, setCombo] = useState(0)
  const [lastCatchTime, setLastCatchTime] = useState(0)
  const [clickEffects, setClickEffects] = useState<{ id: number; x: number; y: number; type: string; points?: number }[]>([])
  const [energy, setEnergy] = useState(gameState.energy)
  const [spawnRate, setSpawnRate] = useState(500)
  const [specialItemTimestamp, setSpecialItemTimestamp] = useState(0)
  const [hasSpecialItem, setHasSpecialItem] = useState(false)
  const [multiplier, setMultiplier] = useState(1)
  const [level, setLevel] = useState(1)
  const [gameAnimationCompleted, setGameAnimationCompleted] = useState(false)

  const canPlay = useCallback(() => {
    return Date.now() - gameState.lastDropGameTimestamp >= 2 * 60 * 60 * 1000
  }, [gameState.lastDropGameTimestamp])

  // Visual elements for special events
  const [showMultiplierEffect, setShowMultiplierEffect] = useState(false)
  const [showLevelUpEffect, setShowLevelUpEffect] = useState(false)

  // Achievements for the drop game
  const [achievements, setAchievements] = useState({
    catchStreak10: false,
    score5000: false,
    level3: false
  })

  useEffect(() => {
    // Mark animation as completed after a short delay to prevent flashing
    if (gameStatus === 'initial') {
      setTimeout(() => {
        setGameAnimationCompleted(true);
      }, 300);
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
        if (score > 1000 * level && level < 5) {
          setLevel(prev => prev + 1)
          setSpawnRate(prev => Math.max(250, prev - 50))
          setShowLevelUpEffect(true)
          setTimeout(() => setShowLevelUpEffect(false), 2000)
        }
      }, 5000)

      // Special items have a chance to appear
      const specialItemTimer = setInterval(() => {
        if (!hasSpecialItem && Math.random() < 0.3) {
          setHasSpecialItem(true)
          setSpecialItemTimestamp(Date.now())
          
          if (gameAreaRef.current) {
            const width = gameAreaRef.current.offsetWidth
            const newItem: FallingItem = {
              id: Date.now(),
              type: "special",
              x: Math.random() * (width - 40),
              y: -40,
              speed: 2,
              rotation: Math.random() * 360,
              scale: 1.2,
            }
            setItems((prev) => [...prev, newItem])
          }
          
          // Special item disappears after 7 seconds if not caught
          setTimeout(() => {
            setHasSpecialItem(false)
            setItems(prev => prev.filter(item => item.type !== "special"))
          }, 7000)
        }
      }, 10000)

      // Item generator
      const itemSpawner = setInterval(() => {
        if (gameAreaRef.current) {
          const width = gameAreaRef.current.offsetWidth
          const itemType = generateItemType(level)
          const newItem: FallingItem = {
            id: Date.now(),
            type: itemType,
            x: Math.random() * (width - 40),
            y: -40,
            speed: Math.random() * (3 + level / 2) + 2, // Speed increases with level
            rotation: Math.random() * 360,
            scale: itemType === "bomb" ? 1.1 : 1.0,
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

      const energyTimer = setInterval(() => {
        setEnergy((prev) => Math.min(prev + gameState.energyRegenRate, gameState.maxEnergy))
      }, 1000)

      return () => {
        clearInterval(timer)
        clearInterval(itemSpawner)
        clearInterval(mover)
        clearInterval(energyTimer)
        clearInterval(specialItemTimer)
        clearInterval(difficultyAdjuster)
        document.body.style.overflow = ""
      }
    }
  }, [gameStatus, gameState.energyRegenRate, gameState.maxEnergy, score, level, hasSpecialItem, spawnRate])

  // Function to determine item type based on level
  const generateItemType = (currentLevel: number): "mic" | "disc" | "bomb" => {
    const bombChance = 0.05 + (currentLevel * 0.03); // More bombs at higher levels
    const discChance = 0.3 + (currentLevel * 0.02); // More discs at higher levels
    
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
      setCombo(0)
      setMultiplier(1)
      setLevel(1)
      setSpawnRate(500)
      gameState.setLastDropGameTimestamp(Date.now())
      setAchievements({
        catchStreak10: false,
        score5000: false,
        level3: false
      })
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
          // Bomb penalty varies by level
          const penalty = Math.min(500, score * 0.15); // Lose 15% of score or up to 500 points
          setScore(prev => Math.max(0, prev - penalty));
          setCombo(0)
          setMultiplier(1)
          
          // Visual feedback
          setClickEffects(prev => [...prev, {
            id: Date.now(),
            x: item.x,
            y: item.y - 30,
            type: "penalty",
            points: -Math.round(penalty)
          }])
        } else {
          const now = Date.now()
          // If catches happen within 1.5 seconds, increase combo
          if (now - lastCatchTime < 1500) {
            setCombo((prev) => {
              const newCombo = prev + 1;
              // Check for combo achievement
              if (newCombo >= 10 && !achievements.catchStreak10) {
                setAchievements(prev => ({...prev, catchStreak10: true}))
                // Add bonus points for achievement
                setScore(prev => prev + 500)
                setClickEffects(prev => [...prev, {
                  id: Date.now(),
                  x: item.x,
                  y: item.y - 60,
                  type: "achievement",
                  points: 500
                }])
              }
              
              // Increase multiplier every 5 combos up to 3x
              if (newCombo % 5 === 0 && multiplier < 3) {
                setMultiplier(prev => {
                  const newMultiplier = Math.min(3, prev + 0.5);
                  setShowMultiplierEffect(true)
                  setTimeout(() => setShowMultiplierEffect(false), 2000)
                  return newMultiplier;
                })
              }
              
              return newCombo;
            })
          } else {
            setCombo(1)
            if (multiplier > 1) {
              setMultiplier(prev => Math.max(1, prev - 0.5))
            }
          }
          setLastCatchTime(now)

          let itemPoints = 0;
          if (item.type === "mic") {
            itemPoints = 10;
          } else if (item.type === "disc") {
            itemPoints = 25;
          } else if (item.type === "special") {
            // Special items apply a temporary boost
            itemPoints = 100;
            setMultiplier(prev => {
              const newMultiplier = 3; // Special items set multiplier to max
              setShowMultiplierEffect(true)
              setTimeout(() => setShowMultiplierEffect(false), 3000)
              return newMultiplier;
            })
            setHasSpecialItem(false)
            
            // Restore some energy when catching special items
            setEnergy(prev => Math.min(gameState.maxEnergy, prev + 30))
          }
          
          // Apply combo and multiplier to points
          const comboBonus = Math.min(combo, 10) / 2; // Up to +5 points per combo level
          const totalPoints = Math.round((itemPoints + comboBonus) * multiplier);
          
          setScore((prev) => prev + totalPoints)
          
          // Visual feedback for points gained
          setClickEffects(prev => [...prev, {
            id: Date.now(),
            x: item.x,
            y: item.y - 30,
            type: "points",
            points: totalPoints
          }])
          
          // Check if score achievement reached
          if (score > 5000 && !achievements.score5000) {
            setAchievements(prev => ({...prev, score5000: true}))
            // Bonus for achievement
            setScore(prev => prev + 1000)
            setClickEffects(prev => [...prev, {
              id: Date.now(),
              x: gameAreaRef.current ? gameAreaRef.current.offsetWidth / 2 : 200,
              y: gameAreaRef.current ? gameAreaRef.current.offsetHeight / 2 : 200,
              type: "achievement",
              points: 1000
            }])
          }
          
          // Check if level achievement reached
          if (level >= 3 && !achievements.level3) {
            setAchievements(prev => ({...prev, level3: true}))
            // Bonus for achievement
            setScore(prev => prev + 800)
            setClickEffects(prev => [...prev, {
              id: Date.now(),
              x: gameAreaRef.current ? gameAreaRef.current.offsetWidth / 2 : 200,
              y: gameAreaRef.current ? gameAreaRef.current.offsetHeight / 2 : 200,
              type: "achievement",
              points: 800
            }])
          }
        }
        
        setItems((prev) => prev.filter((i) => i.id !== item.id))
      }
    },
    [combo, lastCatchTime, energy, multiplier, score, achievements, gameState.maxEnergy, level]
  )

  const earnedCoins = Math.round(score * 10) // 10 $KNYE per point

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

      <AnimatePresence mode="wait">
        {gameStatus !== "playing" && gameAnimationCompleted && (
          <GameCard>
            {gameStatus === "initial" ? (
              <>
                <Play className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-primary mb-4">Drop Game</h2>
                <p className="text-muted-foreground mb-6">
                  Catch microphones and discs to earn $KNYE. Special items boost your multiplier. Avoid the bombs!
                </p>
                <Button 
                  onClick={handleStart} 
                  className="w-full text-lg px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90" 
                  disabled={!canPlay()}
                >
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
                
                <div className="bg-accent p-4 rounded-lg mb-4">
                  <p className="text-lg text-foreground mb-2">Score: <span className="text-primary font-bold">{score}</span></p>
                  <p className="text-lg text-foreground mb-2">Level: <span className="text-primary font-bold">{level}</span></p>
                  <p className="text-lg text-foreground mb-4">Best Combo: <span className="text-primary font-bold">x{Math.min(combo, 10)}</span></p>
                  <p className="text-xl text-foreground">You earned: <span className="text-primary font-bold">{earnedCoins} $KNYE</span></p>
                </div>
                
                {(achievements.catchStreak10 || achievements.score5000 || achievements.level3) && (
                  <div className="mt-4 mb-6">
                    <h3 className="text-primary font-bold mb-2 flex items-center justify-center">
                      <Award className="w-5 h-5 mr-2" />
                      Achievements Unlocked!
                    </h3>
                    <div className="flex flex-col gap-2">
                      {achievements.catchStreak10 && (
                        <div className="text-sm text-foreground">Combo Master (10x combo streak)</div>
                      )}
                      {achievements.score5000 && (
                        <div className="text-sm text-foreground">High Roller (5,000+ score)</div>
                      )}
                      {achievements.level3 && (
                        <div className="text-sm text-foreground">Level Up (Reached level 3)</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={handleStart} 
                    className="text-lg px-6 py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground" 
                    disabled={!canPlay()}
                  >
                    Play Again
                  </Button>
                  <Button
                    onClick={() => {
                      gameState.addCoins(earnedCoins)
                      onClose()
                    }}
                    className="text-lg px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground"
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
                    x{multiplier.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <Battery className="w-5 h-5 mr-2 text-primary" />
              <div className="w-20">
                <Progress
                  value={(energy / gameState.maxEnergy) * 100}
                  className="h-2 bg-secondary/60"
                />
              </div>
            </div>
          </div>
          
          {combo > 1 && (
            <div className="absolute bottom-4 left-4 text-lg text-foreground flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" />
              <span>Combo: x{Math.min(combo, 10)}</span>
            </div>
          )}
          
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
                <span className="text-4xl font-bold text-primary">x{multiplier.toFixed(1)}</span>
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
                className="absolute cursor-pointer"
                initial={{ x: item.x, y: -40, rotate: 0, scale: item.scale || 1 }}
                animate={{ y: item.y, rotate: item.rotation }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0 }}
                onClick={() => handleCatch(item)}
              >
                {item.type === "mic" && <Mic className="w-12 h-12 text-primary" />}
                {item.type === "disc" && <Disc className="w-12 h-12 text-primary" />}
                {item.type === "bomb" && <Bomb className="w-12 h-12 text-destructive" />}
                {item.type === "special" && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Award className="w-14 h-14 text-primary animate-pulse-glow" />
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
                  <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center">
                    <Bomb className="w-8 h-8 text-white" />
                  </div>
                ) : effect.type === "special" ? (
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <Award className="w-8 h-8 text-black" />
                  </div>
                ) : effect.type === "points" ? (
                  <div className="text-xl font-bold text-primary">+{effect.points}</div>
                ) : effect.type === "penalty" ? (
                  <div className="text-xl font-bold text-destructive">{effect.points}</div>
                ) : effect.type === "achievement" ? (
                  <div className="text-xl font-bold text-primary bg-black/30 px-3 py-1 rounded-full">
                    +{effect.points} BONUS!
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
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