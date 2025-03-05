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
  description: string
  unlocked: boolean
}

export interface Achievement {
  id: string
  name: string
  description: string
  requirement: number
  rewardCoins: number
  rewardXP: number
  completed: boolean
  claimed: boolean
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
  experience: number
  level: number
  addExperience: (amount: number) => void
  achievements: Achievement[]
  claimAchievement: (id: string) => void
  prestigeLevel: number
  prestige: () => void
  prestigeMultiplier: number
  unlockedFeatures: string[]
  unlockFeature: (feature: string) => void
  stats: {
    totalCoinsEarned: number
    totalClicksAllTime: number
    longestPlaySession: number
    highestCombo: number
    lifetimePrestige: number
  }
  updateStat: (stat: string, value: number) => void
  
  // Telegram-related fields
  userId: string | null
  playerName: string | null
  setUserId: (id: string) => void
  setPlayerName: (name: string) => void
  lastSaveTimestamp: number
  isDataSynced: boolean
}

// Save game state to local storage with Telegram user support
const saveGameState = (state: any) => {
  try {
    // Add user ID prefix to separate data
    const storageKey = state.userId ? `knyeClickerState_${state.userId}` : "knyeClickerState"
    localStorage.setItem(storageKey, JSON.stringify({
      ...state,
      lastSaveTimestamp: Date.now()
    }))
  } catch (e) {
    console.error("Failed to save game state", e)
  }
}

// Load game state from local storage with Telegram user support
const loadGameState = (userId: string | null = null) => {
  try {
    // Look for game state by user ID first, then in common storage
    const storageKey = userId ? `knyeClickerState_${userId}` : "knyeClickerState"
    const savedState = localStorage.getItem(storageKey)
    
    // If no user-specific save found, check for general storage
    if (!savedState && userId) {
      const generalState = localStorage.getItem("knyeClickerState")
      if (generalState) {
        // Found general save - transfer it to user-specific storage
        const parsedState = JSON.parse(generalState)
        localStorage.setItem(storageKey, JSON.stringify({
          ...parsedState,
          userId,
          lastSaveTimestamp: Date.now()
        }))
        // Remove general save to avoid duplication
        localStorage.removeItem("knyeClickerState")
        return parsedState
      }
    }
    
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

  // Add new state variables for progression
  const [energy, setEnergy] = useState(100)
  const [maxEnergy, setMaxEnergy] = useState(100)
  const [energyRegenRate, setEnergyRegenRate] = useState(1)
  const [experience, setExperience] = useState(0)
  const [level, setLevel] = useState(1)
  const [prestigeLevel, setPrestigeLevel] = useState(0)
  const [prestigeMultiplier, setPrestigeMultiplier] = useState(1)
  const [unlockedFeatures, setUnlockedFeatures] = useState<string[]>(['clicker', 'upgrades', 'wallet', 'social', 'stats'])
  
  // Telegram-specific state
  const [userId, setUserId] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState<string | null>(null)
  const [lastSaveTimestamp, setLastSaveTimestamp] = useState(0)
  const [isDataSynced, setIsDataSynced] = useState(true)
  
  // Game statistics
  const [stats, setStats] = useState({
    totalCoinsEarned: 0,
    totalClicksAllTime: 0,
    longestPlaySession: 0,
    highestCombo: 0,
    lifetimePrestige: 0
  })

  // Initialize achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "clicks_100",
      name: "Beginner Clicker",
      description: "Click 100 times",
      requirement: 100,
      rewardCoins: 500,
      rewardXP: 100,
      completed: false,
      claimed: false,
    },
    {
      id: "clicks_1000",
      name: "Dedicated Clicker",
      description: "Click 1,000 times",
      requirement: 1000,
      rewardCoins: 2000,
      rewardXP: 300,
      completed: false,
      claimed: false,
    },
    {
      id: "coins_10000",
      name: "$KNYE Hoarder",
      description: "Accumulate 10,000 $KNYE coins",
      requirement: 10000,
      rewardCoins: 1000,
      rewardXP: 200,
      completed: false,
      claimed: false,
    },
    {
      id: "upgrades_5",
      name: "Upgrade Enthusiast",
      description: "Purchase 5 upgrades",
      requirement: 5,
      rewardCoins: 1500,
      rewardXP: 250,
      completed: false,
      claimed: false,
    },
    {
      id: "level_10",
      name: "Rising Star",
      description: "Reach level 10",
      requirement: 10,
      rewardCoins: 5000,
      rewardXP: 500,
      completed: false,
      claimed: false,
    },
    {
      id: "prestige_1",
      name: "New Beginning",
      description: "Prestige for the first time",
      requirement: 1,
      rewardCoins: 0,
      rewardXP: 1000,
      completed: false,
      claimed: false,
    },
  ])

  // Initialize upgrades with improved descriptions and progression
  const [clickUpgrades, setClickUpgrades] = useState<Upgrade[]>([
    {
      name: "Microphone",
      cost: 50,
      effect: 0.1,
      level: 0,
      maxLevel: 20,
      costMultiplier: 1.5,
      effectMultiplier: 1.2,
      description: "Better mic means more impact per click",
      unlocked: true,
    },
    {
      name: "Gold Chain",
      cost: 500,
      effect: 0.5,
      level: 0,
      maxLevel: 15,
      costMultiplier: 1.8,
      effectMultiplier: 1.3,
      description: "Bling adds value to your presence",
      unlocked: true,
    },
    {
      name: "Designer Shoes",
      cost: 5000,
      effect: 2,
      level: 0,
      maxLevel: 10,
      costMultiplier: 2.2,
      effectMultiplier: 1.4,
      description: "Walk the walk with premium kicks",
      unlocked: true,
    },
    {
      name: "Studio Time",
      cost: 25000,
      effect: 8,
      level: 0,
      maxLevel: 8,
      costMultiplier: 2.5,
      effectMultiplier: 1.5,
      description: "Professional recording boosts your output",
      unlocked: true,
    },
    {
      name: "Platinum Status",
      cost: 100000,
      effect: 25,
      level: 0,
      maxLevel: 5,
      costMultiplier: 3.0,
      effectMultiplier: 2.0,
      description: "Certified platinum for maximum clicks",
      unlocked: true,
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
      description: "Fans generate passive income",
      unlocked: true,
    },
    {
      name: "Record Deal",
      cost: 1000,
      effect: 0.2,
      level: 0,
      maxLevel: 15,
      costMultiplier: 1.9,
      effectMultiplier: 1.3,
      description: "Contracts bring in steady revenue",
      unlocked: true,
    },
    {
      name: "Fashion Line",
      cost: 10000,
      effect: 1,
      level: 0,
      maxLevel: 10,
      costMultiplier: 2.3,
      effectMultiplier: 1.4,
      description: "Your brand sells while you're away",
      unlocked: true,
    },
    {
      name: "Energy Drink",
      cost: 500,
      effect: 10,
      level: 0,
      maxLevel: 10,
      costMultiplier: 1.5,
      effectMultiplier: 1.2,
      description: "Increases maximum energy",
      unlocked: true,
    },
    {
      name: "Power Nap",
      cost: 2000,
      effect: 0.2,
      level: 0,
      maxLevel: 5,
      costMultiplier: 2,
      effectMultiplier: 1.5,
      description: "Improves energy regeneration rate",
      unlocked: true,
    },
    {
      name: "Music Festival",
      cost: 50000,
      effect: 5,
      level: 0,
      maxLevel: 8,
      costMultiplier: 2.5,
      effectMultiplier: 1.6,
      description: "Perform at festivals for massive passive income",
      unlocked: true,
    },
    {
      name: "World Tour",
      cost: 200000,
      effect: 20,
      level: 0,
      maxLevel: 5,
      costMultiplier: 3.0,
      effectMultiplier: 2.0,
      description: "Global concerts generate enormous revenue",
      unlocked: true,
    },
  ])

  // Effect for loading saved state when userId changes
  useEffect(() => {
    const savedState = loadGameState(userId)
    if (savedState) {
      setCoins(savedState.coins || 0)
      setCoinsPerClick(savedState.coinsPerClick || 0.1)
      setCoinsPerSecond(savedState.coinsPerSecond || 0)
      setClickUpgrades(prev => {
        // Merge saved state with new upgrades to ensure new content is available
        const savedUpgrades = savedState.clickUpgrades || [];
        return prev.map((upgrade, index) => {
          if (index < savedUpgrades.length) {
            return {
              ...upgrade,
              level: savedUpgrades[index].level || 0,
              cost: savedUpgrades[index].cost || upgrade.cost,
              effect: savedUpgrades[index].effect || upgrade.effect,
              unlocked: savedUpgrades[index].unlocked !== undefined ? savedUpgrades[index].unlocked : upgrade.unlocked
            };
          }
          return upgrade;
        });
      })
      setPassiveUpgrades(prev => {
        // Merge saved state with new upgrades
        const savedUpgrades = savedState.passiveUpgrades || [];
        return prev.map((upgrade, index) => {
          if (index < savedUpgrades.length) {
            return {
              ...upgrade,
              level: savedUpgrades[index].level || 0,
              cost: savedUpgrades[index].cost || upgrade.cost,
              effect: savedUpgrades[index].effect || upgrade.effect,
              unlocked: savedUpgrades[index].unlocked !== undefined ? savedUpgrades[index].unlocked : upgrade.unlocked
            };
          }
          return upgrade;
        });
      })
      setWalletAddress(savedState.walletAddress || null)
      setReferrals(savedState.referrals || [])
      setCompletedTasks(savedState.completedTasks || [])
      setTotalClicks(savedState.totalClicks || 0)
      setTotalUpgradesPurchased(savedState.totalUpgradesPurchased || 0)
      setTotalUpgradesCost(savedState.totalUpgradesCost || 0)
      setTotalPlayTime(savedState.totalPlayTime || 0)
      setFirstPlayTimestamp(savedState.firstPlayTimestamp || Date.now())
      setLastDropGameTimestamp(savedState.lastDropGameTimestamp || 0)
      setEnergy(savedState.energy !== undefined ? savedState.energy : 100)
      setMaxEnergy(savedState.maxEnergy !== undefined ? savedState.maxEnergy : 100)
      setEnergyRegenRate(savedState.energyRegenRate !== undefined ? savedState.energyRegenRate : 1)
      setExperience(savedState.experience || 0)
      setLevel(savedState.level || 1)
      setPrestigeLevel(savedState.prestigeLevel || 0)
      setPrestigeMultiplier(savedState.prestigeMultiplier || 1)
      setUnlockedFeatures(savedState.unlockedFeatures || ['clicker', 'upgrades', 'wallet', 'social', 'stats'])
      setStats(savedState.stats || {
        totalCoinsEarned: 0,
        totalClicksAllTime: 0,
        longestPlaySession: 0,
        highestCombo: 0,
        lifetimePrestige: 0
      })
      setPlayerName(savedState.playerName || null)
      
      // Load achievements with backward compatibility
      if (savedState.achievements) {
        setAchievements(prev => {
          // Merge saved achievements with new ones
          const savedAchievements = savedState.achievements;
          const mergedAchievements = [...prev];
          
          // Update existing achievements from save data
          for (let i = 0; i < mergedAchievements.length; i++) {
            const savedAchievement = savedAchievements.find(a => a.id === mergedAchievements[i].id);
            if (savedAchievement) {
              mergedAchievements[i] = {
                ...mergedAchievements[i],
                completed: savedAchievement.completed || false,
                claimed: savedAchievement.claimed || false
              };
            }
          }
          
          return mergedAchievements;
        });
      }
      
      // Set lastSaveTimestamp
      setLastSaveTimestamp(savedState.lastSaveTimestamp || Date.now())
      setIsDataSynced(true)
    }
  }, [userId])

  // Autosave game state when it changes
  useEffect(() => {
    // Avoid empty save on initialization
    if (coins === 0 && totalClicks === 0 && !userId) return
    
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
      experience,
      level,
      achievements,
      prestigeLevel,
      prestigeMultiplier,
      unlockedFeatures,
      stats,
      userId,
      playerName,
      lastSaveTimestamp: Date.now()
    }
    
    saveGameState(state)
    setIsDataSynced(true)
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
    experience,
    level,
    achievements,
    prestigeLevel,
    prestigeMultiplier,
    unlockedFeatures,
    stats,
    userId,
    playerName
  ])

  // Periodic sync for data backup
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (!isDataSynced) {
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
          experience,
          level,
          achievements,
          prestigeLevel,
          prestigeMultiplier,
          unlockedFeatures,
          stats,
          userId,
          playerName,
          lastSaveTimestamp: Date.now()
        }
        
        saveGameState(state)
        setIsDataSynced(true)
      }
    }, 30000) // Sync every 30 seconds
    
    return () => clearInterval(syncInterval)
  }, [isDataSynced])

  // Check achievement completion
  useEffect(() => {
    const newAchievements = [...achievements];
    let changed = false;
    
    // Check each achievement
    newAchievements.forEach(achievement => {
      if (achievement.completed) return;
      
      let completed = false;
      if (achievement.id === "clicks_100" && totalClicks >= 100) {
        completed = true;
      } else if (achievement.id === "clicks_1000" && totalClicks >= 1000) {
        completed = true;
      } else if (achievement.id === "coins_10000" && coins >= 10000) {
        completed = true;
      } else if (achievement.id === "upgrades_5" && totalUpgradesPurchased >= 5) {
        completed = true;
      } else if (achievement.id === "level_10" && level >= 10) {
        completed = true;
      } else if (achievement.id === "prestige_1" && prestigeLevel >= 1) {
        completed = true;
      }
      
      if (completed && !achievement.completed) {
        achievement.completed = true;
        changed = true;
      }
    });
    
    if (changed) {
      setAchievements(newAchievements);
    }
  }, [achievements, totalClicks, coins, totalUpgradesPurchased, level, prestigeLevel]);

  // Handle passive income
  useEffect(() => {
    const timer = setInterval(() => {
      if (coinsPerSecond > 0) {
        const passiveEarning = coinsPerSecond / 10 * prestigeMultiplier;
        setCoins((prev) => prev + passiveEarning);
        // Update total coins earned stat
        setStats(prev => ({
          ...prev,
          totalCoinsEarned: prev.totalCoinsEarned + passiveEarning
        }));
        setIsDataSynced(false)
      }
    }, 100) // Update more frequently for smoother experience

    return () => clearInterval(timer)
  }, [coinsPerSecond, prestigeMultiplier])

  // Energy regeneration
  useEffect(() => {
    const energyTimer = setInterval(() => {
      setEnergy((prev) => Math.min(prev + energyRegenRate, maxEnergy))
      setIsDataSynced(false)
    }, 1000)

    return () => clearInterval(energyTimer)
  }, [energyRegenRate, maxEnergy])

  // Track play time
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalPlayTime((prev) => {
        const newPlayTime = prev + 1;
        // Update longest play session stat if needed
        if (newPlayTime > stats.longestPlaySession) {
          setStats(prevStats => ({
            ...prevStats,
            longestPlaySession: newPlayTime
          }));
        }
        setIsDataSynced(false)
        return newPlayTime;
      });
      // Simulate online users
      setOnlineUsers(Math.floor(Math.random() * 100) + 50 + (prestigeLevel * 20));
    }, 1000)

    return () => clearInterval(timer)
  }, [stats.longestPlaySession, prestigeLevel])

  // Level progression system
  useEffect(() => {
    const xpToNextLevel = level * 500;
    if (experience >= xpToNextLevel) {
      setExperience(prev => prev - xpToNextLevel);
      setLevel(prev => prev + 1);
      setIsDataSynced(false)
      
      // Unlock more advanced upgrades as player levels up
      if (level >= 5) {
        setClickUpgrades(prev => {
          const newUpgrades = [...prev];
          if (!newUpgrades[3].unlocked) {
            newUpgrades[3].unlocked = true;
          }
          return newUpgrades;
        });
        
        setPassiveUpgrades(prev => {
          const newUpgrades = [...prev];
          if (!newUpgrades[5].unlocked) {
            newUpgrades[5].unlocked = true;
          }
          return newUpgrades;
        });
      }
      
      if (level >= 10) {
        setClickUpgrades(prev => {
          const newUpgrades = [...prev];
          if (!newUpgrades[4].unlocked) {
            newUpgrades[4].unlocked = true;
          }
          return newUpgrades;
        });
        
        setPassiveUpgrades(prev => {
          const newUpgrades = [...prev];
          if (!newUpgrades[6].unlocked) {
            newUpgrades[6].unlocked = true;
          }
          return newUpgrades;
        });
      }
    }
  }, [experience, level, unlockedFeatures]);

  // Add coins function
  const addCoins = (amount: number) => {
    const finalAmount = amount * prestigeMultiplier;
    setCoins((prev) => prev + finalAmount);
    // Update total coins earned stat
    setStats(prev => ({
      ...prev,
      totalCoinsEarned: prev.totalCoinsEarned + finalAmount
    }));
    setIsDataSynced(false)
  }

  // Remove coins function
  const removeCoins = (amount: number) => {
    setCoins((prev) => Math.max(0, prev - amount))
    setIsDataSynced(false)
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
        return newCoinsPerClick * prestigeMultiplier
      })
      
      setTotalUpgradesPurchased((prev) => prev + 1)
      addExperience(20) // Award XP for purchasing upgrades
      setIsDataSynced(false)
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
          if (level > 0 && i !== 3 && i !== 4) { // Skip energy upgrades for income calculation
            newCoinsPerSecond += upgradeItem.effect * Math.pow(upgradeItem.effectMultiplier, level - 1) * level
          }
        })
        return newCoinsPerSecond * prestigeMultiplier
      })

      if (upgrade.name === "Energy Drink") {
        setMaxEnergy((prev) => prev + upgrade.effect)
      } else if (upgrade.name === "Power Nap") {
        setEnergyRegenRate((prev) => prev + upgrade.effect)
      }

      setTotalUpgradesPurchased((prev) => prev + 1)
      addExperience(20) // Award XP for purchasing upgrades
      setIsDataSynced(false)
    }
  }

  // Add referral function
  const addReferral = (referralCode: string) => {
    if (!referrals.includes(referralCode)) {
      setReferrals((prev) => [...prev, referralCode])
      addCoins(1000) // Reward for referral
      addExperience(100) // XP for referral
      setIsDataSynced(false)
    }
  }

  // Complete task function
  const completeTask = (taskId: string) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks((prev) => [...prev, taskId])
      addCoins(500) // Reward for task completion
      addExperience(50) // XP for task completion
      setIsDataSynced(false)
    }
  }

  // Energy usage function
  const useEnergy = (amount: number) => {
    if (energy >= amount) {
      setEnergy((prev) => prev - amount);
      setIsDataSynced(false)
      return true
    }
    return false
  }

  // Add experience function
  const addExperience = (amount: number) => {
    setExperience(prev => prev + amount)
    setIsDataSynced(false)
  }

  // Claim achievement function
  const claimAchievement = (id: string) => {
    setAchievements(prev => {
      const newAchievements = [...prev];
      const achievementIndex = newAchievements.findIndex(a => a.id === id);
      
      if (achievementIndex !== -1) {
        const achievement = newAchievements[achievementIndex];
        
        if (achievement.completed && !achievement.claimed) {
          // Mark as claimed
          newAchievements[achievementIndex] = {
            ...achievement,
            claimed: true
          };
          
          // Give rewards
          addCoins(achievement.rewardCoins);
          addExperience(achievement.rewardXP);
        }
      }
      
      return newAchievements;
    });
    setIsDataSynced(false)
  }

  // Prestige function - reset progress but with multiplier
  const prestige = () => {
    if (coins >= 1000000) { // Require 1M coins to prestige
      const newPrestigeLevel = prestigeLevel + 1;
      const newMultiplier = 1 + (newPrestigeLevel * 0.25); // Each prestige level gives +25% bonus
      
      // Reset progress
      setCoins(0);
      setCoinsPerClick(0.1 * newMultiplier);
      setCoinsPerSecond(0);
      
      // Reset upgrades but keep unlocks
      setClickUpgrades(prev => prev.map(upgrade => ({
        ...upgrade,
        level: 0,
        cost: upgrade.cost / Math.pow(upgrade.costMultiplier, upgrade.level * 1.5),
        effect: upgrade.effect / Math.pow(upgrade.effectMultiplier, upgrade.level),
      })));
      
      setPassiveUpgrades(prev => prev.map(upgrade => ({
        ...upgrade,
        level: 0,
        cost: upgrade.cost / Math.pow(upgrade.costMultiplier, upgrade.level * 1.5),
        effect: upgrade.effect / Math.pow(upgrade.effectMultiplier, upgrade.level),
      })));
      
      // Restore some energy stats
      setEnergy(100);
      setMaxEnergy(100);
      setEnergyRegenRate(1);
      
      // Set prestige level and multiplier
      setPrestigeLevel(newPrestigeLevel);
      setPrestigeMultiplier(newMultiplier);
      
      // Add experience for prestiging
      addExperience(1000);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        lifetimePrestige: prev.lifetimePrestige + 1
      }));
      
      setIsDataSynced(false)
    }
  }

  // Unlock feature function
  const unlockFeature = (feature: string) => {
    if (!unlockedFeatures.includes(feature)) {
      setUnlockedFeatures(prev => [...prev, feature]);
      setIsDataSynced(false)
    }
  }

  // Update stat function
  const updateStat = (stat: string, value: number) => {
    setStats(prev => {
      const newStats = {...prev};
      if (stat === 'highestCombo' && value > prev.highestCombo) {
        newStats.highestCombo = value;
      } else if (stat === 'totalClicksAllTime') {
        newStats.totalClicksAllTime = prev.totalClicksAllTime + value;
      }
      return newStats;
    });
    setIsDataSynced(false)
  }

  // Telegram-specific functions
  const handleSetUserId = (id: string) => {
    setUserId(id)
  }

  const handleSetPlayerName = (name: string) => {
    setPlayerName(name)
    setIsDataSynced(false)
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
    experience,
    level,
    addExperience,
    achievements,
    claimAchievement,
    prestigeLevel,
    prestige,
    prestigeMultiplier,
    unlockedFeatures,
    unlockFeature,
    stats,
    updateStat,
    
    // Telegram-specific fields and methods
    userId,
    playerName,
    setUserId: handleSetUserId,
    setPlayerName: handleSetPlayerName,
    lastSaveTimestamp,
    isDataSynced
  }
}