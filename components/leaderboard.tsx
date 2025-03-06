"use client"

import { useState, useEffect } from "react"
import { Trophy, ArrowUp, ArrowDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LeaderboardEntry {
  id: string
  name: string
  score: number
  change: number
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    // In a real app, you would fetch this data from your backend
    const mockLeaderboard: LeaderboardEntry[] = [
      { id: "1", name: "Yeezy", score: 10000, change: 2 },
      { id: "2", name: "Pablo", score: 9500, change: -1 },
      { id: "3", name: "Dropout", score: 9000, change: 1 },
      { id: "4", name: "Golddigger", score: 8500, change: 0 },
      { id: "5", name: "Heartless", score: 8000, change: 3 },
    ]
    setLeaderboard(mockLeaderboard)
  }, [])

  return (
    <Card className="bg-secondary border-none mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="space-y-1">
          <AnimatePresence>
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center justify-between p-2 bg-accent rounded-md"
              >
                <div className="flex items-center gap-2">
                  <span className="text-primary font-medium w-5 text-center">{index + 1}</span>
                  <span className="text-white">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{entry.score.toLocaleString()}</span>
                  {entry.change > 0 && (
                    <div className="flex items-center text-green-400">
                      <ArrowUp className="w-3 h-3" />
                      <span className="text-xs">{entry.change}</span>
                    </div>
                  )}
                  {entry.change < 0 && (
                    <div className="flex items-center text-red-400">
                      <ArrowDown className="w-3 h-3" />
                      <span className="text-xs">{Math.abs(entry.change)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}