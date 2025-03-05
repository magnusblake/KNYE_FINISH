"use client"

import { useState, useEffect } from "react"
import type { GameState } from "@/hooks/useGameState"
import { Button } from "@/components/ui/button"
import { Gift, Coins, Calendar, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DailyBonusProps {
  gameState: GameState
}

export function DailyBonus({ gameState }: DailyBonusProps) {
  const [timeUntilNextBonus, setTimeUntilNextBonus] = useState<number | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [claimedBonus, setClaimedBonus] = useState<number | null>(null)
  const [streakDays, setStreakDays] = useState(0)
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null)

  useEffect(() => {
    const checkDailyBonus = () => {
      const lastClaimTime = localStorage.getItem("lastDailyBonusClaim")
      const streakData = localStorage.getItem("dailyBonusStreak")
      const lastClaimDateStr = localStorage.getItem("lastDailyBonusDate")
      
      // Load streak count
      if (streakData) {
        setStreakDays(parseInt(streakData))
      }
      
      // Load last claim date
      if (lastClaimDateStr) {
        setLastClaimDate(lastClaimDateStr)
      }
      
      if (lastClaimTime) {
        const timeSinceClaim = Date.now() - Number.parseInt(lastClaimTime)
        const timeRemaining = Math.max(24 * 60 * 60 * 1000 - timeSinceClaim, 0)
        setTimeUntilNextBonus(timeRemaining)
      } else {
        setTimeUntilNextBonus(0)
      }
    }

    checkDailyBonus()
    const interval = setInterval(checkDailyBonus, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`
  }

  const claimDailyBonus = () => {
    setClaiming(true)
    setTimeout(() => {
      // Check streak - if last claim was yesterday, increment streak; otherwise reset
      let newStreak = 1
      const today = new Date().toDateString()
      
      if (lastClaimDate) {
        const lastDate = new Date(lastClaimDate)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        
        if (lastDate.toDateString() === yesterday.toDateString()) {
          // Claimed yesterday, increment streak
          newStreak = streakDays + 1
        } else if (lastDate.toDateString() !== today) {
          // Missed a day, reset streak
          newStreak = 1
        } else {
          // Already claimed today (shouldn't happen, but just in case)
          newStreak = streakDays
        }
      }
      
      // Calculate bonus with streak multiplier
      const baseBonus = Math.floor(Math.random() * 901) + 100 // Random bonus between 100 and 1000
      const streakMultiplier = Math.min(2, 1 + (newStreak * 0.1)) // Up to 2x bonus at 10-day streak
      const bonus = Math.floor(baseBonus * streakMultiplier)
      
      // Apply prestige multiplier if available
      const finalBonus = Math.floor(bonus * gameState.prestigeMultiplier)
      
      // Award bonus
      gameState.addCoins(finalBonus)
      gameState.addExperience(25 * Math.min(5, newStreak)) // XP bonus increases with streak
      
      // Save streak and timestamp
      setStreakDays(newStreak)
      localStorage.setItem("dailyBonusStreak", newStreak.toString())
      localStorage.setItem("lastDailyBonusClaim", Date.now().toString())
      localStorage.setItem("lastDailyBonusDate", new Date().toDateString())
      setLastClaimDate(new Date().toDateString())
      
      setTimeUntilNextBonus(24 * 60 * 60 * 1000)
      setClaiming(false)
      setClaimedBonus(finalBonus)
      setTimeout(() => setClaimedBonus(null), 3000) // Hide the bonus after 3 seconds
    }, 1500)
  }

  const progressValue = timeUntilNextBonus !== null ? 100 - (timeUntilNextBonus / (24 * 60 * 60 * 1000)) * 100 : 0

  return (
    <Card className="bg-secondary border-none mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Daily Bonus
          {streakDays > 1 && (
            <div className="ml-auto flex items-center text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              <Calendar className="w-3 h-3 mr-1" />
              {streakDays} day streak
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {timeUntilNextBonus === 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground text-center mb-2">
                {streakDays > 0 ? (
                  <p>Keep your {streakDays} day streak going for a bigger bonus!</p>
                ) : (
                  <p>Claim your daily bonus to start a streak</p>
                )}
              </div>
              
              <Button
                onClick={claimDailyBonus}
                disabled={claiming}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {claiming ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                    Claiming...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    {streakDays > 1 && <span className="text-xs mr-2">{Math.min(2, 1 + (streakDays * 0.1)).toFixed(1)}x</span>}
                    Claim Daily Bonus
                    <Gift className="ml-2 w-4 h-4" />
                  </div>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next bonus in:</span>
                <span className="font-medium text-primary">{formatTime(timeUntilNextBonus || 0)}</span>
              </div>
              <Progress value={progressValue} className="h-2 bg-muted/50" />
              
              {streakDays > 1 && (
                <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Current streak: {streakDays} days</span>
                </div>
              )}
            </div>
          )}

          <AnimatePresence>
            {claimedBonus && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 text-center"
              >
                <div className="bg-accent p-3 rounded-lg inline-block">
                  <div className="flex items-center justify-center gap-1 text-primary font-bold">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <Coins className="w-5 h-5" />
                    <span>+{claimedBonus.toLocaleString()} $KNYE!</span>
                  </div>
                  {streakDays > 1 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {streakDays} day streak bonus applied!
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  )
}