"use client"

import type React from "react"
import { useState } from "react"
import { Disc3, ZapIcon, TrendingUp, Clock, Users, Award, Sparkles, CoinsIcon, Rocket, Trophy, Target } from "lucide-react"
import type { GameState } from "@/hooks/useGameState"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Achievements } from "@/components/achievements"

interface StatsViewProps {
  gameState: GameState
}

export function StatsView({ gameState }: StatsViewProps) {
  const [activeStatsTab, setActiveStatsTab] = useState<"general" | "achievements">("general")
  
  // Calculate level progress
  const xpForCurrentLevel = gameState.level * 500
  const xpProgress = (gameState.experience / xpForCurrentLevel) * 100
  
  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    } else {
      return num.toFixed(0)
    }
  }
  
  // Format time from seconds to hours & minutes
  const formatPlayTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
  
  // Calculate more engaging stats
  const clicksPerSecond = gameState.totalClicks / Math.max(1, gameState.totalPlayTime)
  const avgCoinsPerClick = gameState.coins / Math.max(1, gameState.totalClicks)
  const passivePercentage = gameState.coinsPerSecond > 0 
    ? (gameState.coinsPerSecond / (gameState.coinsPerSecond + gameState.coinsPerClick * clicksPerSecond)) * 100
    : 0

  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1 text-primary">Your Stats</h2>
        <p className="text-muted-foreground">Track your $KNYE mining progress</p>
      </div>
      
      {/* Level progress */}
      <Card className="mb-6 bg-secondary border-none">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-primary">Level {gameState.level}</span>
            </div>
            <span className="text-muted-foreground text-sm">{gameState.experience} / {xpForCurrentLevel} XP</span>
          </div>
          <Progress value={xpProgress} className="h-2 mb-1" />
          <p className="text-xs text-muted-foreground text-right">
            {Math.floor(xpForCurrentLevel - gameState.experience)} XP until level {gameState.level + 1}
          </p>
        </CardContent>
      </Card>
      
      <Tabs value={activeStatsTab} onValueChange={(value: string) => setActiveStatsTab(value as "general" | "achievements")}>
        <TabsList className="mb-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            General Stats
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Achievements
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              icon={<ZapIcon className="w-6 h-6" />}
              title="Clicking Power"
              value={`${gameState.coinsPerClick.toFixed(1)} $KNYE/click`}
              subtext={`Total clicks: ${gameState.totalClicks.toLocaleString()}`}
            />

            <StatCard
              icon={<Disc3 className="w-6 h-6" />}
              title="Passive Income"
              value={`${gameState.coinsPerSecond.toFixed(1)} $KNYE/sec`}
              subtext={`${passivePercentage.toFixed(0)}% of your income is passive`}
            />

            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Upgrades"
              value={`${gameState.totalUpgradesPurchased} purchased`}
              subtext={`Total spent: ${gameState.totalUpgradesCost.toLocaleString()} $KNYE`}
            />

            <StatCard
              icon={<Clock className="w-6 h-6" />}
              title="Play Time"
              value={formatPlayTime(gameState.totalPlayTime)}
              subtext={`First played: ${new Date(gameState.firstPlayTimestamp).toLocaleDateString()}`}
            />

            <StatCard
              icon={<CoinsIcon className="w-6 h-6" />}
              title="Lifetime Earnings"
              value={`${formatNumber(gameState.stats.totalCoinsEarned)} $KNYE`}
              subtext={`Average: ${avgCoinsPerClick.toFixed(1)} coins per click`}
            />
            
            <StatCard
              icon={<Target className="w-6 h-6" />}
              title="Best Performance"
              value={`${gameState.stats.highestCombo}x combo`}
              subtext={`${clicksPerSecond.toFixed(1)} clicks per second avg`}
            />
            
            {gameState.prestigeLevel > 0 && (
              <StatCard
                icon={<Sparkles className="w-6 h-6" />}
                title="Prestige Level"
                value={`Level ${gameState.prestigeLevel}`}
                subtext={`${gameState.prestigeMultiplier.toFixed(2)}x earnings multiplier`}
              />
            )}

            <StatCard
              icon={<Users className="w-6 h-6" />}
              title="Online Users"
              value={gameState.onlineUsers.toString()}
              subtext="Players mining $KNYE right now"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="achievements">
          <Achievements gameState={gameState} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string
  subtext: string
}

function StatCard({ icon, title, value, subtext }: StatCardProps) {
  return (
    <motion.div
      className="bg-secondary p-4 rounded-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-primary">{icon}</div>
        <h3 className="text-lg font-bold text-primary">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{subtext}</p>
    </motion.div>
  )
}