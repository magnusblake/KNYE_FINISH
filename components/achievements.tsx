import { useState } from "react"
import type { GameState } from "@/hooks/useGameState"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, CheckCircle, LockIcon, Award, Star, Coins } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"

interface AchievementsProps {
  gameState: GameState
}

export function Achievements({ gameState }: AchievementsProps) {
  const [claimingAchievement, setClaimingAchievement] = useState<string | null>(null)
  const [showClaimEffect, setShowClaimEffect] = useState<string | null>(null)

  const handleClaimAchievement = async (achievementId: string) => {
    setClaimingAchievement(achievementId)
    
    // Simulate a slight delay for effect
    await new Promise(resolve => setTimeout(resolve, 600))
    
    gameState.claimAchievement(achievementId)
    
    // Show claim effect
    setShowClaimEffect(achievementId)
    setTimeout(() => {
      setShowClaimEffect(null)
    }, 2000)
    
    setClaimingAchievement(null)
  }

  // Calculate progress for incomplete achievements
  const getAchievementProgress = (achievement: any) => {
    const { id, requirement } = achievement;
    
    if (id.startsWith("clicks_")) {
      return Math.min(100, (gameState.totalClicks / requirement) * 100);
    } else if (id.startsWith("coins_")) {
      return Math.min(100, (gameState.coins / requirement) * 100);
    } else if (id.startsWith("upgrades_")) {
      return Math.min(100, (gameState.totalUpgradesPurchased / requirement) * 100);
    } else if (id.startsWith("level_")) {
      return Math.min(100, (gameState.level / requirement) * 100);
    } else if (id.startsWith("prestige_")) {
      return Math.min(100, (gameState.prestigeLevel / requirement) * 100);
    }
    
    return 0;
  }

  // Group achievements by completion status
  const completedAchievements = gameState.achievements.filter(a => a.completed);
  const uncompletedAchievements = gameState.achievements.filter(a => !a.completed);

  return (
    <div className="space-y-4">
      <Card className="bg-secondary border-none p-4 rounded-xl mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-bold text-primary">Achievements</h3>
        </div>

        {uncompletedAchievements.length > 0 && (
          <div className="mb-6 space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">In Progress</h4>
            {uncompletedAchievements.map((achievement) => (
              <div key={achievement.id} className="bg-accent p-3 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="mt-1 text-muted-foreground">
                      <LockIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{achievement.name}</p>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-primary flex items-center mb-1">
                      <Coins className="w-4 h-4 mr-1" /> 
                      {achievement.rewardCoins}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {achievement.rewardXP} XP
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={getAchievementProgress(achievement)} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {completedAchievements.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Completed</h4>
            {completedAchievements.map((achievement) => (
              <div key={achievement.id} className="bg-accent p-3 rounded-lg relative overflow-hidden">
                <AnimatePresence>
                  {showClaimEffect === achievement.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      className="absolute inset-0 bg-primary/20 flex items-center justify-center z-10"
                    >
                      <motion.div
                        initial={{ y: 0 }}
                        animate={{ y: -10 }}
                        className="text-primary font-bold flex items-center"
                      >
                        <Star className="w-5 h-5 mr-1" />
                        Claimed!
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="mt-1 text-primary">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{achievement.name}</p>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                  
                  {!achievement.claimed ? (
                    <Button
                      onClick={() => handleClaimAchievement(achievement.id)}
                      disabled={claimingAchievement === achievement.id}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
                      size="sm"
                    >
                      {claimingAchievement === achievement.id ? (
                        "Claiming..."
                      ) : (
                        <>
                          Claim
                          <CheckCircle className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Claimed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {completedAchievements.length === 0 && uncompletedAchievements.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No achievements available yet</p>
          </div>
        )}
      </Card>
    </div>
  )
}