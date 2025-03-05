import { useState } from "react"
import type { GameState } from "@/hooks/useGameState"
import { type Achievement, achievements } from "@/lib/achievements"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, CheckCircle } from "lucide-react"

interface AchievementsProps {
  gameState: GameState
}

export function Achievements({ gameState }: AchievementsProps) {
  const [claimingAchievement, setClaimingAchievement] = useState<string | null>(null)

  const handleClaimAchievement = (achievement: Achievement) => {
    setClaimingAchievement(achievement.id)
    setTimeout(() => {
      gameState.claimAchievement(achievement.id)
      setClaimingAchievement(null)
    }, 1000)
  }

  return (
    <Card className="bg-zinc-900/60 border-zinc-800 p-4 rounded-xl mb-4">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-amber-400" />
        <h3 className="text-lg font-bold">Achievements</h3>
      </div>

      <div className="space-y-4">
        {achievements.map((achievement) => {
          const isUnlocked = gameState.achievements.includes(achievement.id)
          return (
            <div key={achievement.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{achievement.name}</p>
                <p className="text-sm text-zinc-400">{achievement.description}</p>
              </div>
              {isUnlocked ? (
                <Button
                  onClick={() => handleClaimAchievement(achievement)}
                  disabled={claimingAchievement === achievement.id}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  {claimingAchievement === achievement.id ? (
                    "Claiming..."
                  ) : (
                    <>
                      Claim
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-sm text-zinc-500">
                  {achievement.requirement -
                    (achievement.id.startsWith("clicks")
                      ? gameState.totalClicks
                      : achievement.id.startsWith("coins")
                        ? gameState.coins
                        : gameState.totalUpgradesPurchased)}{" "}
                  to go
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

