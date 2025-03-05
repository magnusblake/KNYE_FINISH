"use client"

import { useEffect, useState } from "react"

export interface Upgrade {
  name: string
  cost: number
  effect: number
  level: number
  maxLevel: number
  costMultiplier: number
  effectMultiplier: number
}

export interface GameState {
  coins: number
  coinsPerClick: number
  coinsPerSecond: number
  clickUpgrades: Upgrade[]
  passiveUpgrades: Upgrade[]
  walletAddress: string | null
  referrals: string[]
  completedTasks: string[]
  totalClicks: number
  totalUpgradesPurchased: number
  addCoins: (amount: number) => void
  removeCoins: (amount: number) => void
  purchaseClickUpgrade: (index: number) => void
  purchasePassiveUpgrade: (index: number) => void
  setWalletAddress: (address: string) => void
  addReferral: (referralCode: string) => void
  completeTask: (taskId: string) => void
  totalUpgradesCost: number
  totalPlayTime: number
  firstPlayTimestamp: number
  onlineUsers: number
  lastDropGameTimestamp: number
  setLastDropGameTimestamp: (timestamp: number) => void
  energy: number
  maxEnergy: number
  energyRegenRate: number
  useEnergy: (amount: number) => boolean
}

// Save game state to local storage
const saveGameState = (state: any) => {
  try {
    localStorage.setItem("knyeClickerState", JSON.stringify(state))
  } catch (e) {
    console.error("Failed to save game state", e)
  }
}

// Load game state from local storage
const loadGameState = () => {
  try {
    const savedState = localStorage.getItem("knyeClickerState")
    if (savedState) {
      return JSON.parse(savedState)
    }
  } catch (e) {
    console.error("Failed to load game state", e)
  }
  return null
}

export function useGameState(): GameState {
  // Initialize state with default values
  const [coins, setCoins] = useState(0)
  const [coinsPerClick, setCoinsPerClick] = useState(0.1)
  const [coinsPerSecond, setCoinsPerSecond] = useState(0)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  // Add new state variables
  const [referrals, setReferrals] = useState<string[]>([])
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [totalClicks, setTotalClicks] = useState(0)
  const [totalUpgradesPurchased, setTotalUpgradesPurchased] = useState(0)
  const [totalUpgradesCost, setTotalUpgradesCost] = useState(0)
  const [totalPlayTime, setTotalPlayTime] = useState(0)
  const [firstPlayTimestamp, setFirstPlayTimestamp] = useState(Date.now())
  const [onlineUsers, setOnlineUsers] = useState(0)
  const [lastDropGameTimestamp, setLastDropGameTimestamp] = useState(0)

  // Add new state variables
  const [energy, setEnergy] = useState(100)
  const [maxEnergy, setMaxEnergy] = useState(100)
  const [energyRegenRate, setEnergyRegenRate] = useState(1)

  // Initialize upgrades
  const [clickUpgrades, setClickUpgrades] = useState<Upgrade[]>([
    {
      name: "Microphone",
      cost: 50,
      effect: 0.1,
      level: 0,
      maxLevel: 20,
      costMultiplier: 1.5,
      effectMultiplier: 1.2,
    },
    {
      name: "Gold Chain",
      cost: 500,
      effect: 0.5,
      level: 0,
      maxLevel: 15,
      costMultiplier: 1.8,
      effectMultiplier: 1.3,
    },
    {
      name: "Designer Shoes",
      cost: 5000,
      effect: 2,
      level: 0,
      maxLevel: 10,
      costMultiplier: 2.2,
      effectMultiplier: 1.4,
    },
  ])

  const [passiveUpgrades, setPassiveUpgrades] = useState<Upgrade[]>([
    {
      name: "Fan Base",
      cost: 100,
      effect: 0.05,
      level: 0,
      maxLevel: 20,
      costMultiplier: 1.6,
      effectMultiplier: 1.2,
    },
    {
      name: "Record Deal",
      cost: 1000,
      effect: 0.2,
      level: 0,
      maxLevel: 15,
      costMultiplier: 1.9,
      effectMultiplier: 1.3,
    },
    {
      name: "Fashion Line",
      cost: 10000,
      effect: 1,
      level: 0,
      maxLevel: 10,
      costMultiplier: 2.3,
      effectMultiplier: 1.4,
    },
    {
      name: "Energy Drink",
      cost: 500,
      effect: 10,
      level: 0,
      maxLevel: 10,
      costMultiplier: 1.5,
      effectMultiplier: 1.2,
    },
    {
      name: "Power Nap",
      cost: 2000,
      effect: 0.2,
      level: 0,
      maxLevel: 5,
      costMultiplier: 2,
      effectMultiplier: 1.5,
    },
  ])

  // Load saved state on first render
  useEffect(() => {
    const savedState = loadGameState()
    if (savedState) {
      setCoins(savedState.coins || 0)
      setCoinsPerClick(savedState.coinsPerClick || 0.1)
      setCoinsPerSecond(savedState.coinsPerSecond || 0)
      setClickUpgrades((prev) => savedState.clickUpgrades || prev)
      setPassiveUpgrades((prev) => savedState.passiveUpgrades || prev)
      setWalletAddress(savedState.walletAddress || null)
      setReferrals(savedState.referrals || [])
      setCompletedTasks(savedState.completedTasks || [])
      setTotalClicks(savedState.totalClicks || 0)
      setTotalUpgradesPurchased(savedState.totalUpgradesPurchased || 0)
      setTotalUpgradesCost(savedState.totalUpgradesCost || 0)
      setTotalPlayTime(savedState.totalPlayTime || 0)
      setFirstPlayTimestamp(savedState.firstPlayTimestamp || Date.now())
      setLastDropGameTimestamp(savedState.lastDropGameTimestamp || 0)
    }
  }, [])

  // Autosave game state when it changes
  useEffect(() => {
    const state = {
      coins,
      coinsPerClick,
      coinsPerSecond,
      clickUpgrades,
      passiveUpgrades,
      walletAddress,
      referrals,
      completedTasks,
      totalClicks,
      totalUpgradesPurchased,
      totalUpgradesCost,
      totalPlayTime,
      firstPlayTimestamp,
      lastDropGameTimestamp,
      energy,
      maxEnergy,
      energyRegenRate,
    }
    saveGameState(state)
  }, [
    coins,
    coinsPerClick,
    coinsPerSecond,
    clickUpgrades,
    passiveUpgrades,
    walletAddress,
    referrals,
    completedTasks,
    totalClicks,
    totalUpgradesPurchased,
    totalUpgradesCost,
    totalPlayTime,
    firstPlayTimestamp,
    lastDropGameTimestamp,
    energy,
    maxEnergy,
    energyRegenRate,
  ])

  // Handle passive income
  useEffect(() => {
    const timer = setInterval(() => {
      if (coinsPerSecond > 0) {
        setCoins((prev) => prev + coinsPerSecond / 10)
      }
    }, 100) // Update more frequently for smoother experience

    return () => clearInterval(timer)
  }, [coinsPerSecond])

  // Add coins function
  const addCoins = (amount: number) => {
    setCoins((prev) => prev + amount)
  }

  // Remove coins function
  const removeCoins = (amount: number) => {
    setCoins((prev) => Math.max(0, prev - amount))
  }

  // Purchase click upgrade
  const purchaseClickUpgrade = (index: number) => {
    const upgrade = clickUpgrades[index]

    if (coins >= upgrade.cost && upgrade.level < upgrade.maxLevel) {
      setCoins((prev) => prev - upgrade.cost)
      setTotalUpgradesCost((prev) => prev + upgrade.cost)

      setClickUpgrades((prev) => {
        const newUpgrades = [...prev]
        newUpgrades[index] = {
          ...upgrade,
          level: upgrade.level + 1,
          cost: Math.floor(upgrade.cost * Math.pow(upgrade.costMultiplier, 1.5)),
          effect: upgrade.effect * upgrade.effectMultiplier,
        }
        return newUpgrades
      })

      setCoinsPerClick((prev) => {
        let newCoinsPerClick = 0.1 // Base value
        clickUpgrades.forEach((upgradeItem, i) => {
          const level = i === index ? upgrade.level + 1 : upgradeItem.level
          if (level > 0) {
            newCoinsPerClick += upgradeItem.effect * Math.pow(upgradeItem.effectMultiplier, level - 1) * level
          }
        })
        return newCoinsPerClick
      })
      setTotalUpgradesPurchased((prev) => prev + 1)
    }
  }

  // Purchase passive upgrade
  const purchasePassiveUpgrade = (index: number) => {
    const upgrade = passiveUpgrades[index]

    if (coins >= upgrade.cost && upgrade.level < upgrade.maxLevel) {
      setCoins((prev) => prev - upgrade.cost)
      setTotalUpgradesCost((prev) => prev + upgrade.cost)

      setPassiveUpgrades((prev) => {
        const newUpgrades = [...prev]
        newUpgrades[index] = {
          ...upgrade,
          level: upgrade.level + 1,
          cost: Math.floor(upgrade.cost * Math.pow(upgrade.costMultiplier, 1.5)),
          effect: upgrade.effect * upgrade.effectMultiplier,
        }
        return newUpgrades
      })

      setCoinsPerSecond((prev) => {
        let newCoinsPerSecond = 0
        passiveUpgrades.forEach((upgradeItem, i) => {
          const level = i === index ? upgrade.level + 1 : upgradeItem.level
          if (level > 0) {
            newCoinsPerSecond += upgradeItem.effect * Math.pow(upgradeItem.effectMultiplier, level - 1) * level
          }
        })
        return newCoinsPerSecond
      })

      if (upgrade.name === "Energy Drink") {
        setMaxEnergy((prev) => prev + upgrade.effect)
      } else if (upgrade.name === "Power Nap") {
        setEnergyRegenRate((prev) => prev + upgrade.effect)
      }

      setTotalUpgradesPurchased((prev) => prev + 1)
    }
  }

  const addReferral = (referralCode: string) => {
    setReferrals((prev) => [...prev, referralCode])
    addCoins(1000) // Reward for referral
  }

  const completeTask = (taskId: string) => {
    setCompletedTasks((prev) => [...prev, taskId])
    addCoins(500) // Reward for task completion
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalPlayTime((prev) => prev + 1)
      setOnlineUsers(Math.floor(Math.random() * 100) + 50) // Simulated online users
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const energyTimer = setInterval(() => {
      setEnergy((prev) => Math.min(prev + energyRegenRate, maxEnergy))
    }, 1000)

    return () => clearInterval(energyTimer)
  }, [energyRegenRate, maxEnergy])

  const useEnergy = (amount: number) => {
    if (energy >= amount) {
      setEnergy((prev) => prev - amount)
      return true
    }
    return false
  }

  return {
    coins,
    coinsPerClick,
    coinsPerSecond,
    clickUpgrades,
    passiveUpgrades,
    walletAddress,
    referrals,
    completedTasks,
    addCoins,
    removeCoins,
    purchaseClickUpgrade,
    purchasePassiveUpgrade,
    setWalletAddress,
    addReferral,
    completeTask,
    totalClicks,
    totalUpgradesPurchased,
    totalUpgradesCost,
    totalPlayTime,
    firstPlayTimestamp,
    onlineUsers,
    lastDropGameTimestamp,
    setLastDropGameTimestamp,
    useEnergy,
    energy,
    maxEnergy,
    energyRegenRate,
  }
}

