"use client"

import { Disc3, ShoppingCart, Wallet, Users, BarChart2, LockIcon } from "lucide-react"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NavigationProps {
  activeTab: "clicker" | "upgrades" | "wallet" | "social" | "stats"
  setActiveTab: (tab: "clicker" | "upgrades" | "wallet" | "social" | "stats") => void
  unlockedFeatures: string[]
}

export function Navigation({ activeTab, setActiveTab, unlockedFeatures }: NavigationProps) {
  const navItems = [
    {
      id: "clicker",
      label: "Clicker",
      icon: <Disc3 className="w-5 h-5" />,
      unlockLevel: 0, // Available from start
    },
    {
      id: "upgrades",
      label: "Upgrades",
      icon: <ShoppingCart className="w-5 h-5" />,
      unlockLevel: 0, // Available from start
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: <Wallet className="w-5 h-5" />,
      unlockLevel: 3,
    },
    {
      id: "social",
      label: "Social",
      icon: <Users className="w-5 h-5" />,
      unlockLevel: 5,
    },
    {
      id: "stats",
      label: "Stats",
      icon: <BarChart2 className="w-5 h-5" />,
      unlockLevel: 8,
    },
  ]

  return (
    <TooltipProvider>
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {navItems.map((item) => {
              const isUnlocked = unlockedFeatures.includes(item.id)
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => isUnlocked && setActiveTab(item.id as any)}
                      className={`relative flex flex-col items-center justify-center py-3 px-2 w-full ${
                        activeTab === item.id ? "text-primary" : "text-muted-foreground hover:text-primary"
                      } ${!isUnlocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {item.icon}
                      <span className="text-xs mt-1 hidden sm:inline">{item.label}</span>
                      {!isUnlocked && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center">
                          <LockIcon className="w-3 h-3 text-muted-foreground" />
                        </span>
                      )}
                      {activeTab === item.id && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                          layoutId="activeTab"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  </TooltipTrigger>
                  
                  {!isUnlocked && (
                    <TooltipContent side="top">
                      <p className="text-xs">Unlocks at level {item.unlockLevel}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </div>
        </div>
      </nav>
    </TooltipProvider>
  )
}