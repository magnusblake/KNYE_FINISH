"use client"

import { useEffect, useState } from "react"
import { useGameState } from "@/hooks/useGameState"
import { ClickerView } from "@/components/clicker-view"
import { UpgradesView } from "@/components/upgrades-view"
import { WalletView } from "@/components/wallet-view"
import { Navigation } from "@/components/navigation"
import { ReferralProgram } from "@/components/referral-program"
import { Tasks } from "@/components/tasks"
import { DailyBonus } from "@/components/daily-bonus"
import { Leaderboard } from "@/components/leaderboard"
import { StatsView } from "@/components/stats-view"
import { motion, AnimatePresence } from "framer-motion"
import { GuessAlbumGame } from "@/components/guess-album-game"
import { Coins, Disc3, Globe, BellIcon as BrandTelegram } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"clicker" | "upgrades" | "wallet" | "social" | "stats">("clicker")
  const gameState = useGameState()
  const [tg, setTg] = useState<any>(null)

  useEffect(() => {
    const tgApp = window.Telegram?.WebApp
    if (tgApp) {
      tgApp.ready()
      tgApp.expand()
      setTg(tgApp)
    }
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden relative">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">$KNYE</span>
            <div className="bg-secondary px-3 py-1 rounded-full flex items-center">
              <Coins className="w-4 h-4 text-primary mr-2" />
              <span className="text-white font-medium text-sm">{Math.floor(gameState.coins).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Disc3 className="w-4 h-4 mr-1" />
              <span>{gameState.coinsPerSecond.toFixed(1)}/sec</span>
            </div>
            <Link
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              <Globe className="w-5 h-5" />
            </Link>
            <Link
              href="https://t.me/example"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              <BrandTelegram className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-24 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "clicker" && (
              <>
                <DailyBonus gameState={gameState} />
                <ClickerView gameState={gameState} />
              </>
            )}
            {activeTab === "upgrades" && <UpgradesView gameState={gameState} />}
            {activeTab === "wallet" && <WalletView gameState={gameState} />}
            {activeTab === "social" && (
              <>
                <Leaderboard />
                <GuessAlbumGame gameState={gameState} />
                <ReferralProgram gameState={gameState} />
                <Tasks gameState={gameState} />
              </>
            )}
            {activeTab === "stats" && <StatsView gameState={gameState} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  )
}

