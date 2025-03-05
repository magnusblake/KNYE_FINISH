"use client"

import { useState, useEffect } from "react"
import type { GameState } from "@/hooks/useGameState"
import { Button } from "@/components/ui/button"
import { Gift, Coins } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"

interface DailyBonusProps {
  gameState: GameState
}

export function DailyBonus({ gameState }: DailyBonusProps) {
  const [timeUntilNextBonus, setTimeUntilNextBonus] = useState<number | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [claimedBonus, setClaimedBonus] = useState<number | null>(null)

  useEffect(() => {
    const checkDailyBonus = () => {
      const lastClaimTime = localStorage.getItem("lastDailyBonusClaim")
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
      const bonus = Math.floor(Math.random() * 901) + 100 // Random bonus between 100 and 1000
      gameState.addCoins(bonus)
      localStorage.setItem("lastDailyBonusClaim", Date.now().toString())
      setTimeUntilNextBonus(24 * 60 * 60 * 1000)
      setClaiming(false)
      setClaimedBonus(bonus)
      setTimeout(() => setClaimedBonus(null), 3000) // Hide the bonus after 3 seconds
    }, 1500)
  }

  const progressValue = timeUntilNextBonus !== null ? 100 - (timeUntilNextBonus / (24 * 60 * 60 * 1000)) * 100 : 0

  return (
    <motion.div
      className="bg-secondary p-4 rounded-lg mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Gift className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-bold text-primary">Daily Bonus</h3>
      </div>

      {timeUntilNextBonus === 0 ? (
        <Button
          onClick={claimDailyBonus}
          disabled={claiming}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {claiming ? "Claiming..." : "Claim Daily Bonus"}
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next bonus in:</span>
            <span className="font-medium text-primary">{formatTime(timeUntilNextBonus || 0)}</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      )}

      <AnimatePresence>
        {claimedBonus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 text-center text-primary font-bold"
          >
            <Coins className="w-6 h-6 inline-block mr-2" />
            Claimed {claimedBonus} $KNYE!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

