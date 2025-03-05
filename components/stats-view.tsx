"use client"

import type React from "react"
import { Disc3, ZapIcon, TrendingUp, Clock, Users } from "lucide-react"
import type { GameState } from "@/hooks/useGameState"

interface StatsViewProps {
  gameState: GameState
}

export function StatsView({ gameState }: StatsViewProps) {
  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1 text-primary">Your Stats</h2>
        <p className="text-muted-foreground">Track your $KNYE mining progress</p>
      </div>

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
          subtext={`Total passive: ${(gameState.coins - gameState.totalClicks * gameState.coinsPerClick).toFixed(0)} $KNYE`}
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
          icon={<Users className="w-6 h-6" />}
          title="Online Users"
          value={gameState.onlineUsers.toString()}
          subtext="Players mining $KNYE right now"
        />
      </div>
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
    <div className="bg-secondary p-4 rounded-lg">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-primary">{icon}</div>
        <h3 className="text-lg font-bold text-primary">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{subtext}</p>
    </div>
  )
}

function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

