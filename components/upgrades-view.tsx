"use client"

import type React from "react"
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
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface UpgradesViewProps {
  gameState: GameState
}

interface UpgradeItemProps {
  title: string
  description: string
  cost: number
  level: number
  maxLevel: number
  effect: string
  onPurchase: () => void
  canAfford: boolean
  icon: React.ReactNode
}

function UpgradeItem({
  title,
  description,
  cost,
  level,
  maxLevel,
  effect,
  onPurchase,
  canAfford,
  icon,
}: UpgradeItemProps) {
  return (
    <div className="bg-secondary p-4 rounded-lg mb-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-primary">{icon}</div>
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-bold text-lg text-primary">{title}</h3>
            <span className="text-sm text-muted-foreground">
              Lv. {level}/{maxLevel}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mb-2">{description}</p>
          <Progress value={(level / maxLevel) * 100} className="h-2 mb-3" indicatorColor="bg-primary" />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium text-sm">{effect}</span>
            <Button
              size="sm"
              onClick={onPurchase}
              disabled={!canAfford || level >= maxLevel}
              className={
                !canAfford || level >= maxLevel
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }
            >
              {level >= maxLevel ? (
                "MAX"
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
  const clickUpgrades = gameState.clickUpgrades.map((upgrade, index) => ({
    id: `click-${index}`,
    title: upgrade.name,
    description: `Increase your clicking power.`,
    cost: upgrade.cost,
    level: upgrade.level,
    maxLevel: upgrade.maxLevel,
    effect: `+${upgrade.effect.toFixed(1)} coins per click`,
    onPurchase: () => gameState.purchaseClickUpgrade(index),
    canAfford: gameState.coins >= upgrade.cost,
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
      ) : upgrade.name === "Fan Base" ? (
        <UsersIcon className="w-6 h-6" />
      ) : upgrade.name === "Record Deal" ? (
        <Disc3Icon className="w-6 h-6" />
      ) : (
        <PaletteIcon className="w-6 h-6" />
      ),
  }))

  const passiveUpgrades = gameState.passiveUpgrades.map((upgrade, index) => ({
    id: `passive-${index}`,
    title: upgrade.name,
    description:
      upgrade.name === "Energy Drink"
        ? "Increase your maximum energy."
        : upgrade.name === "Power Nap"
          ? "Increase your energy regeneration rate."
          : "Earn coins automatically.",
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
      ) : (
        <PaletteIcon className="w-6 h-6" />
      ),
  }))

  const allUpgrades = [...clickUpgrades, ...passiveUpgrades]

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-1 text-primary">Upgrades</h2>
      <p className="text-muted-foreground mb-6">Boost your $KNYE mining efficiency</p>

      <div className="space-y-4">
        {allUpgrades.map((upgrade) => (
          <UpgradeItem key={upgrade.id} {...upgrade} />
        ))}
      </div>
    </div>
  )
}

