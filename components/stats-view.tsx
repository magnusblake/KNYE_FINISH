"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  const [hasUnclaimedAchievements, setHasUnclaimedAchievements] = useState(false)
  
  // Calculate level progress
  const xpForCurrentLevel = gameState.level * 500
  const xpProgress = (gameState.experience / xpForCurrentLevel) * 100
  
  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return Math.floor(num / 1000000) + 'M'
    } else if (num >= 1000) {
      return Math.floor(num / 1000) + 'K'
    } else {
      return Math.floor(num).toString()
    }
  }
  
  // Format time from seconds to hours & minutes - removed seconds for simplicity
  const formatPlayTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
  
  // Fixed Average Coins Per Click calculation
  const totalClicks = Math.max(1, gameState.totalClicks)
  const avgCoinsPerClick = Math.floor(gameState.stats.totalCoinsEarned / totalClicks)
    
  // Check for unclaimed achievements
  useEffect(() => {
    const unclaimedAchievements = gameState.achievements.some(a => a.completed && !a.claimed)
    setHasUnclaimedAchievements(unclaimedAchievements)
  }, [gameState.achievements])

  return (
    <div className="py-2">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1 text-primary">Your Stats</h2>
        <p className="text-muted-foreground">Track your $KNYE mining progress</p>
      </div>
      
      {/* Level progress */}
      <Card className="mb-4 bg-secondary border-none">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-primary">Level {gameState.level}</span>
            </div>
            <span className="text-muted-foreground text-sm">{gameState.experience} / {xpForCurrentLevel} XP</span>
          </div>
          <Progress value={xpProgress} className="h-2 mb-1 bg-accent" />
          <p className="text-xs text-muted-foreground text-right">
            {Math.floor(xpForCurrentLevel - gameState.experience)} XP until level {gameState.level + 1}
          </p>
        </CardContent>
      </Card>
      
      <Tabs value={activeStatsTab} onValueChange={(value: string) => setActiveStatsTab(value as "general" | "achievements")} className="w-full">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="general" className="flex-1 flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4" />
            General Stats
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex-1 flex items-center justify-center gap-2 relative">
            <Trophy className="w-4 h-4" />
            Achievements
            {hasUnclaimedAchievements && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"></span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              icon={<ZapIcon className="w-6 h-6" />}
              title="Clicking Power"
              value={`${Math.floor(gameState.coinsPerClick)} $KNYE/click`}
              subtext={`Total clicks: ${gameState.totalClicks.toLocaleString()}`}
            />

            <StatCard
              icon={<Disc3 className="w-6 h-6" />}
              title="Passive Income"
              value={`${Math.floor(gameState.coinsPerSecond)} $KNYE/s`}
              subtext={`Total income: ${formatNumber(gameState.coins)} $KNYE`}
            />

            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Upgrades"
              value={`${gameState.totalUpgradesPurchased} purchased`}
              subtext={`Total spent: ${Math.floor(gameState.totalUpgradesCost).toLocaleString()} $KNYE`}
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
              subtext={`Avg: ${avgCoinsPerClick} $KNYE/click`}
            />
            
            {gameState.prestigeLevel > 0 && (
              <StatCard
                icon={<Sparkles className="w-6 h-6" />}
                title="Prestige Level"
                value={`Level ${gameState.prestigeLevel}`}
                subtext={`${Math.floor(gameState.prestigeMultiplier)}x earnings multiplier`}
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
        
        <TabsContent value="achievements" className="w-full">
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