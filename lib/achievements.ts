export interface Achievement {
  id: string
  name: string
  description: string
  requirement: number
  rewardCoins: number
  rewardXP: number
}

export const achievements: Achievement[] = [
  {
    id: "clicks_100",
    name: "Beginner Clicker",
    description: "Click 100 times",
    requirement: 100,
    rewardCoins: 500,
    rewardXP: 100,
  },
  {
    id: "clicks_1000",
    name: "Dedicated Clicker",
    description: "Click 1,000 times",
    requirement: 1000,
    rewardCoins: 2000,
    rewardXP: 300,
  },
  {
    id: "coins_10000",
    name: "$KNYE Hoarder",
    description: "Accumulate 10,000 $KNYE coins",
    requirement: 10000,
    rewardCoins: 1000,
    rewardXP: 200,
  },
  {
    id: "upgrades_5",
    name: "Upgrade Enthusiast",
    description: "Purchase 5 upgrades",
    requirement: 5,
    rewardCoins: 1500,
    rewardXP: 250,
  },
]

