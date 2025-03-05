"use client"

import { useState, useEffect } from "react"
import { Trophy, ArrowUp, ArrowDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
    <div className="bg-secondary p-4 rounded-lg mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-bold text-primary">Leaderboard</h3>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-2 bg-accent rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary w-6 text-center">{index + 1}</span>
                <span className="text-white">{entry.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{entry.score.toLocaleString()}</span>
                {entry.change > 0 && <ArrowUp className="w-4 h-4 text-green-400" />}
                {entry.change < 0 && <ArrowDown className="w-4 h-4 text-red-400" />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

