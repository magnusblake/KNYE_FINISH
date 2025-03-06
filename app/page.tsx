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
import { GameHeader } from "@/components/game-header"
import { TelegramProvider, useTelegram } from "@/hooks/useTelegram"
import { LoadingScreen } from "@/components/loading-screen"
import { OnboardingSlides } from "@/components/onboarding-slides"

// Main component wrapper with Telegram Provider
export default function HomePage() {
  return (
    <TelegramProvider>
      <GameContent />
    </TelegramProvider>
  )
}

// Game content with Telegram integration
function GameContent() {
  const [activeTab, setActiveTab] = useState<"clicker" | "upgrades" | "wallet" | "social" | "stats">("clicker")
  const gameState = useGameState()
  const [showWelcome, setShowWelcome] = useState(false)
  const { isReady, user, tg } = useTelegram()
  
  // Save game state ID based on Telegram user ID
  useEffect(() => {
    if (user.id && gameState.setUserId) {
      gameState.setUserId(user.id.toString())
      
      // Set player name from Telegram if available
      if (user.username && gameState.setPlayerName) {
        gameState.setPlayerName(user.username)
      } else if (user.firstName && gameState.setPlayerName) {
        gameState.setPlayerName(user.firstName + (user.lastName ? ` ${user.lastName}` : ''))
      }
    }
  }, [user.id, user.username, user.firstName, user.lastName, gameState])

  useEffect(() => {
    // Show onboarding slides for new players only if not returning
    const hasPlayedBefore = localStorage.getItem("hasPlayedBefore")
    if (!hasPlayedBefore && isReady) {
      setShowWelcome(true)
    }
  }, [isReady])
  
  // Handle Telegram back button
  useEffect(() => {
    if (tg && tg.BackButton) {
      // Show back button when not on clicker tab
      if (activeTab !== "clicker") {
        tg.BackButton.show()
        
        const handleBackButton = () => {
          setActiveTab("clicker")
        }
        
        tg.onEvent('backButtonClicked', handleBackButton)
        return () => {
          tg.offEvent('backButtonClicked', handleBackButton)
        }
      } else {
        tg.BackButton.hide()
      }
    }
  }, [activeTab, tg])

  // Show loading screen until Telegram WebApp is ready
  if (!isReady) {
    return <LoadingScreen />
  }

  return (
    <main className="min-h-svh max-h-svh bg-background text-foreground overflow-hidden relative flex flex-col">
      <GameHeader gameState={gameState} />

      <div className="container mx-auto px-4 flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full pb-14"
          >
            {activeTab === "clicker" && (
              <ClickerView gameState={gameState} />
            )}
            {activeTab === "upgrades" && <UpgradesView gameState={gameState} />}
            {activeTab === "wallet" && <WalletView gameState={gameState} />}
            {activeTab === "social" && (
              <div className="h-full flex flex-col gap-2">
                <DailyBonus gameState={gameState} />
                <Leaderboard />
                <ReferralProgram 
                  gameState={gameState} 
                  telegramUsername={user.username || undefined}
                />
                <Tasks gameState={gameState} />
              </div>
            )}
            {activeTab === "stats" && <StatsView gameState={gameState} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        unlockedFeatures={gameState.unlockedFeatures}
        gameState={gameState}
      />
      
      {/* Onboarding slides for new players */}
      {showWelcome && (
        <OnboardingSlides 
          onClose={() => {
            setShowWelcome(false)
            localStorage.setItem("hasPlayedBefore", "true")
          }}
          username={user.firstName || user.username}
        />
      )}
    </main>
  )
}