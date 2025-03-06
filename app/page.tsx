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
    // Show welcome message for new players only if not returning
    const hasPlayedBefore = localStorage.getItem("hasPlayedBefore")
    if (!hasPlayedBefore && isReady) {
      setShowWelcome(true)
      localStorage.setItem("hasPlayedBefore", "true")
      
      // Auto-dismiss welcome message after 5 seconds
      setTimeout(() => {
        setShowWelcome(false)
      }, 5000)
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
    <main className="min-h-svh max-h-svh bg-background text-foreground overflow-hidden relative">
      <GameHeader gameState={gameState} />

      <div className="container mx-auto px-4 pb-24 pt-6 h-[calc(100vh-160px)] overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "clicker" && (
              <ClickerView gameState={gameState} />
            )}
            {activeTab === "upgrades" && <UpgradesView gameState={gameState} />}
            {activeTab === "wallet" && <WalletView gameState={gameState} />}
            {activeTab === "social" && (
              <>
                <DailyBonus gameState={gameState} />
                <Leaderboard />
                <ReferralProgram 
                  gameState={gameState} 
                  telegramUsername={user.username || undefined}
                />
                <Tasks gameState={gameState} />
              </>
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
      
      {/* Welcome popup for new players */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg max-w-sm w-full text-center z-50"
          >
            <h3 className="font-bold text-lg mb-1">
              {user.firstName ? `Привет, ${user.firstName}!` : 'Добро пожаловать!'}
            </h3>
            <p className="text-sm mb-3">Жми на кнопку, чтобы заработать $KNYE. Покупай улучшения, чтобы увеличить доход!</p>
            <button 
              onClick={() => setShowWelcome(false)}
              className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-black/20 text-xs"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}