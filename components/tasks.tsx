"use client"

import { useState } from "react"
import type { GameState } from "@/hooks/useGameState"
import { Button } from "@/components/ui/button"
import { CheckSquare, ExternalLink, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TasksProps {
  gameState: GameState
}

const TASKS = [
  { id: "telegram", name: "Subscribe to Telegram", reward: 1000 },
  { id: "twitter", name: "Follow on X", reward: 800 },
  { id: "discord", name: "Join Discord", reward: 1200 },
]

export function Tasks({ gameState }: TasksProps) {
  const [completingTask, setCompletingTask] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCompleteTask = async (taskId: string) => {
    setCompletingTask(taskId)
    setError(null)
    // Simulate task completion (in a real app, you'd verify this server-side)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      gameState.completeTask(taskId)
    } catch (err: any) {
      setError("Failed to complete task. Please try again.")
    } finally {
      setCompletingTask(null)
    }
  }

  return (
    <Card className="bg-secondary border-none mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          Daily Tasks
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="space-y-3">
          <AnimatePresence>
            {TASKS.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-accent p-3 rounded-md"
              >
                <div className="flex justify-between">
                  <h4 className="font-medium text-md text-primary">{task.name}</h4>
                  <div className="text-sm text-muted-foreground">+{task.reward} $KNYE</div>
                </div>
                <Button
                  onClick={() => handleCompleteTask(task.id)}
                  disabled={gameState.completedTasks.includes(task.id) || completingTask === task.id}
                  className={
                    !gameState.completedTasks.includes(task.id) && completingTask !== task.id
                      ? "w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "w-full mt-2 bg-muted text-muted-foreground"
                  }
                >
                  {gameState.completedTasks.includes(task.id) ? (
                    "Completed"
                  ) : completingTask === task.id ? (
                    "Verifying..."
                  ) : (
                    <>
                      Complete <ExternalLink className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-destructive/20 border border-destructive rounded-lg text-destructive flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}