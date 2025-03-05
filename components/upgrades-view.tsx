"use client"

import { useState } from "react"
import type { GameState } from "@/hooks/useGameState"
import { Button } from "@/components/ui/button"
import {
  CoinsIcon,
  Mic2Icon,
  LinkIcon,
  ShirtIcon,
  UsersIcon,
  Disc3Icon,
  PaletteIcon,
  BatteryIcon,
  CoffeeIcon,
  Radio,
  Music,
  Trophy,
  Globe,
  Headphones,
  Sparkles,
  FolderClosed,
  Tag
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface UpgradesViewProps {
  gameState: GameState
}

interface UpgradeItemProps {
  id: string
  title: string
  description: string
  cost: number
  level: number
  maxLevel: number
  effect: string
  onPurchase: () => void
  canAfford: boolean
  icon: React.ReactNode
  locked?: boolean
  tabColor?: string
}

function UpgradeItem({
  id,
  title,
  description,
  cost,
  level,
  maxLevel,
  effect,
  onPurchase,
  canAfford,
  icon,
  locked = false,
  tabColor = "bg-primary"
}: UpgradeItemProps) {
  const [showPurchaseEffect, setShowPurchaseEffect] = useState(false)
  
  const handlePurchase = () => {
    if (canAfford && level < maxLevel && !locked) {
      onPurchase()
      setShowPurchaseEffect(true)
      setTimeout(() => setShowPurchaseEffect(false), 1000)
    }
  }

  return (
    <div className={`bg-secondary p-4 rounded-lg mb-4 relative ${locked ? 'opacity-70' : ''}`}>
      <AnimatePresence>
        {showPurchaseEffect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="absolute inset-0 bg-primary/20 rounded-lg z-10 flex items-center justify-center"
          >
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: -20 }}
              exit={{ opacity: 0 }}
              className="text-primary font-bold text-xl"
            >
              Upgraded!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg ${tabColor} flex items-center justify-center text-black`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-primary flex items-center">
              {title}
              {locked && <Tag className="w-4 h-4 ml-2 text-muted-foreground" />}
            </h3>
            <span className="text-sm text-muted-foreground">
              Lv. {level}/{maxLevel}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mb-2">{description}</p>
          <Progress 
            value={(level / maxLevel) * 100} 
            className="h-2 mb-3" 
            indicatorColor={locked ? "bg-muted" : "bg-primary"} 
          />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium text-sm">{effect}</span>
            <Button
              size="sm"
              onClick={handlePurchase}
              disabled={!canAfford || level >= maxLevel || locked}
              className={
                !canAfford || level >= maxLevel || locked
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }
            >
              {level >= maxLevel ? (
                "MAX"
              ) : locked ? (
                "Locked"
              ) : (
                <>
                  <CoinsIcon className="w-4 h-4 mr-1" />
                  {cost.toLocaleString()}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function UpgradesView({ gameState }: UpgradesViewProps) {
  const [activeTab, setActiveTab] = useState("click")
  const [showPrestigeConfirm, setShowPrestigeConfirm] = useState(false)
  
  const handlePrestige = () => {
    if (gameState.coins >= 1000000) {
      gameState.prestige()
      setShowPrestigeConfirm(false)
    }
  }
  
  const clickUpgrades = gameState.clickUpgrades.map((upgrade, index) => ({
    id: `click-${index}`,
    title: upgrade.name,
    description: upgrade.description || `Increase your clicking power.`,
    cost: upgrade.cost,
    level: upgrade.level,
    maxLevel: upgrade.maxLevel,
    effect: `+${upgrade.effect.toFixed(1)} coins per click`,
    onPurchase: () => gameState.purchaseClickUpgrade(index),
    canAfford: gameState.coins >= upgrade.cost,
    locked: !upgrade.unlocked,
    icon:
      upgrade.name === "Energy Drink" ? (
        <CoffeeIcon className="w-6 h-6" />
      ) : upgrade.name === "Power Nap" ? (
        <BatteryIcon className="w-6 h-6" />
      ) : upgrade.name === "Microphone" ? (
        <Mic2Icon className="w-6 h-6" />
      ) : upgrade.name === "Gold Chain" ? (
        <LinkIcon className="w-6 h-6" />
      ) : upgrade.name === "Designer Shoes" ? (
        <ShirtIcon className="w-6 h-6" />
      ) : upgrade.name === "Studio Time" ? (
        <Music className="w-6 h-6" />
      ) : upgrade.name === "Platinum Status" ? (
        <Trophy className="w-6 h-6" />
      ) : (
        <PaletteIcon className="w-6 h-6" />
      ),
  }))

  const passiveUpgrades = gameState.passiveUpgrades.map((upgrade, index) => ({
    id: `passive-${index}`,
    title: upgrade.name,
    description: upgrade.description || 
      (upgrade.name === "Energy Drink"
        ? "Increase your maximum energy."
        : upgrade.name === "Power Nap"
          ? "Increase your energy regeneration rate."
          : "Earn coins automatically."),
    cost: upgrade.cost,
    level: upgrade.level,
    maxLevel: upgrade.maxLevel,
    effect:
      upgrade.name === "Energy Drink"
        ? `+${upgrade.effect.toFixed(1)} max energy`
        : upgrade.name === "Power Nap"
          ? `+${upgrade.effect.toFixed(1)} energy/sec`
          : `+${upgrade.effect.toFixed(1)} coins per second`,
    onPurchase: () => gameState.purchasePassiveUpgrade(index),
    canAfford: gameState.coins >= upgrade.cost,
    locked: !upgrade.unlocked,
    icon:
      upgrade.name === "Fan Base" ? (
        <UsersIcon className="w-6 h-6" />
      ) : upgrade.name === "Record Deal" ? (
        <Disc3Icon className="w-6 h-6" />
      ) : upgrade.name === "Fashion Line" ? (
        <PaletteIcon className="w-6 h-6" />
      ) : upgrade.name === "Energy Drink" ? (
        <CoffeeIcon className="w-6 h-6" />
      ) : upgrade.name === "Power Nap" ? (
        <BatteryIcon className="w-6 h-6" />
      ) : upgrade.name === "Music Festival" ? (
        <Headphones className="w-6 h-6" />
      ) : upgrade.name === "World Tour" ? (
        <Globe className="w-6 h-6" />
      ) : (
        <Radio className="w-6 h-6" />
      ),
  }))

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-primary">Upgrades</h2>
          <p className="text-muted-foreground">Boost your $KNYE mining efficiency</p>
        </div>
        
        {gameState.level >= 10 && (
          <Button
            onClick={() => setShowPrestigeConfirm(true)}
            disabled={gameState.coins < 1000000}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Prestige
            {gameState.prestigeLevel > 0 && (
              <Badge className="ml-1 bg-black text-primary">{gameState.prestigeLevel}</Badge>
            )}
          </Button>
        )}
      </div>
      
      {gameState.prestigeLevel > 0 && (
        <Card className="mb-6 bg-secondary border-none">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <p className="text-foreground font-medium">Prestige Multiplier</p>
                <p className="text-muted-foreground text-sm">All earnings boosted by {(gameState.prestigeMultiplier).toFixed(2)}x</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">{(gameState.prestigeMultiplier).toFixed(2)}x</div>
          </CardContent>
        </Card>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="click" className="flex items-center gap-2">
            <Mic2Icon className="w-4 h-4" />
            Click Upgrades
          </TabsTrigger>
          <TabsTrigger value="passive" className="flex items-center gap-2">
            <Disc3Icon className="w-4 h-4" />
            Passive Income
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="click" className="space-y-4">
          {clickUpgrades.map((upgrade) => (
            <UpgradeItem key={upgrade.id} {...upgrade} tabColor="bg-primary" />
          ))}
        </TabsContent>
        
        <TabsContent value="passive" className="space-y-4">
          {passiveUpgrades.map((upgrade) => (
            <UpgradeItem key={upgrade.id} {...upgrade} tabColor="bg-primary" />
          ))}
        </TabsContent>
      </Tabs>
      
      <AnimatePresence>
        {showPrestigeConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-secondary rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-primary mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Prestige Confirmation
              </h3>
              
              <p className="text-muted-foreground mb-4">
                Prestiging will reset your progress but give you a permanent multiplier to all future earnings.
              </p>
              
              <div className="bg-accent rounded-lg p-4 mb-6">
                <h4 className="font-medium text-foreground mb-2">What will happen:</h4>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• All coins and upgrades will be reset</li>
                  <li>• Your multiplier will increase to {(1 + ((gameState.prestigeLevel + 1) * 0.25)).toFixed(2)}x</li>
                  <li>• Unlocked features will remain available</li>
                  <li>• You'll earn 1000 XP</li>
                </ul>
              </div>
              
              <div className="flex gap-4 justify-end">
                <Button 
                  onClick={() => setShowPrestigeConfirm(false)}
                  variant="outline"
                  className="border-muted-foreground text-foreground"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePrestige}
                  disabled={gameState.coins < 1000000}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Confirm Prestige
                </Button>
              </div>
              
              {gameState.coins < 1000000 && (
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  You need 1,000,000 coins to prestige
                  <br />
                  Current coins: {Math.floor(gameState.coins).toLocaleString()}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}