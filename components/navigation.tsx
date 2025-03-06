"use client"

import { useState, useEffect } from "react"
import { Disc3, ShoppingCart, Wallet, Users, BarChart2 } from "lucide-react"
import { motion } from "framer-motion"
import type { GameState } from "@/hooks/useGameState" 

interface NavigationProps {
  activeTab: "clicker" | "upgrades" | "wallet" | "social" | "stats"
  setActiveTab: (tab: "clicker" | "upgrades" | "wallet" | "social" | "stats") => void
  unlockedFeatures: string[]
  gameState: GameState
}

export function Navigation({ activeTab, setActiveTab, unlockedFeatures, gameState }: NavigationProps) {
  const [hasUnclaimedAchievements, setHasUnclaimedAchievements] = useState(false)
  
  // Check for unclaimed achievements
  useEffect(() => {
    const unclaimedAchievements = gameState.achievements.some(a => a.completed && !a.claimed)
    setHasUnclaimedAchievements(unclaimedAchievements)
  }, [gameState.achievements])
  
  const navItems = [
    {
      id: "clicker",
      label: "Clicker",
      icon: <Disc3 className="w-5 h-5" />,
    },
    {
      id: "upgrades",
      label: "Upgrades",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      id: "social",
      label: "Social",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: "stats",
      label: "Stats",
      icon: <BarChart2 className="w-5 h-5" />,
      badge: hasUnclaimedAchievements
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`relative flex flex-col items-center justify-center py-3 px-2 w-full ${
                activeTab === item.id ? "text-primary" : "text-muted-foreground hover:text-primary"
              } cursor-pointer`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"></span>
                )}
              </div>
              <span className="text-xs mt-1 hidden sm:inline">{item.label}</span>
              {activeTab === item.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}