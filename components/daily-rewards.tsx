"use client"

import { useState, useEffect } from "react"
import type { GameState } from "@/hooks/useGameState"
import { Button } from "@/components/ui/button"
import { Gift, Clock } from "lucide-react"

interface DailyRewardsProps {
  gameState: GameState
}

export function DailyRewards({ gameState }: DailyRewardsProps) {
  const [timeUntilNextReward, setTimeUntilNextReward] = useState<number | null>(null)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    const checkDailyReward = () => {
      const lastClaimTime = localStorage.getItem("lastDailyRewardClaim")
      if (lastClaimTime) {
        const timeSinceClaim = Date.now() - Number.parseInt(lastClaimTime)
        const timeRemaining = Math.max(24 * 60 * 60 * 1000 - timeSinceClaim, 0)
        setTimeUntilNextReward(timeRemaining)
      } else {
        setTimeUntilNextReward(0)
      }
    }

    checkDailyReward()
    const interval = setInterval(checkDailyReward, 1000)
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

  const claimDailyReward = () => {
    setClaiming(true)
    setTimeout(() => {
      const reward = Math.floor(Math.random() * 901) + 100 // Random reward between 100 and 1000
      gameState.addCoins(reward)
      gameState.addExperience(50)
      localStorage.setItem("lastDailyRewardClaim", Date.now().toString())
      setTimeUntilNextReward(24 * 60 * 60 * 1000)
      setClaiming(false)
    }, 1500)
  }

  return (
    <div className="bg-secondary p-4 rounded-lg mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Gift className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-bold text-primary">Daily Reward</h3>
      </div>

      {timeUntilNextReward === 0 ? (
        <Button
          onClick={claimDailyReward}
          disabled={claiming}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {claiming ? "Claiming..." : "Claim Daily Reward"}
        </Button>
      ) : (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="w-5 h-5" />
          <span>Next reward in: {formatTime(timeUntilNextReward || 0)}</span>
        </div>
      )}
    </div>
  )
}

