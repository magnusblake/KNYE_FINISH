"use client"

import { useState, useEffect } from "react"
import type { GameState } from "@/hooks/useGameState"
import { Button } from "@/components/ui/button"
import { Music, Loader } from "lucide-react"

interface GuessAlbumGameProps {
  gameState: GameState
}

const kanyeAlbums = [
  "The College Dropout",
  "Late Registration",
  "Graduation",
  "808s & Heartbreak",
  "My Beautiful Dark Twisted Fantasy",
  "Yeezus",
  "The Life of Pablo",
  "ye",
  "Jesus Is King",
  "Donda",
]

export function GuessAlbumGame({ gameState }: GuessAlbumGameProps) {
  const [currentAlbum, setCurrentAlbum] = useState("")
  const [options, setOptions] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (cooldown === 0) {
      startNewRound()
    }
  }, [cooldown])

  const startNewRound = () => {
    const newAlbum = kanyeAlbums[Math.floor(Math.random() * kanyeAlbums.length)]
    setCurrentAlbum(newAlbum)

    const newOptions = [newAlbum]
    while (newOptions.length < 4) {
      const randomAlbum = kanyeAlbums[Math.floor(Math.random() * kanyeAlbums.length)]
      if (!newOptions.includes(randomAlbum)) {
        newOptions.push(randomAlbum)
      }
    }
    setOptions(newOptions.sort(() => Math.random() - 0.5))

    setSelectedOption(null)
    setResult(null)
  }

  const handleGuess = (album: string) => {
    setSelectedOption(album)
    if (album === currentAlbum) {
      setResult("correct")
      gameState.addCoins(500)
    } else {
      setResult("incorrect")
    }
    setCooldown(30) // 30 second cooldown
  }

  return (
    <div className="bg-secondary p-4 rounded-lg mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Music className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-bold text-primary">Guess the Kanye Album</h3>
      </div>

      {cooldown > 0 ? (
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Next round in {cooldown} seconds</p>
        </div>
      ) : (
        <>
          <p className="text-center mb-4 text-muted-foreground">Which Kanye West album has this track?</p>
          <p className="text-center text-xl font-bold mb-6 text-primary">"{currentAlbum}"</p>
          <div className="grid grid-cols-2 gap-2">
            {options.map((album) => (
              <Button
                key={album}
                onClick={() => handleGuess(album)}
                disabled={!!selectedOption}
                className={`${
                  selectedOption === album
                    ? album === currentAlbum
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                    : "bg-primary hover:bg-primary/90"
                } text-primary-foreground`}
              >
                {album}
              </Button>
            ))}
          </div>
          {result && (
            <p className={`text-center mt-4 ${result === "correct" ? "text-green-400" : "text-red-400"}`}>
              {result === "correct" ? "Correct! +500 $KNYE" : "Incorrect. Try again next round!"}
            </p>
          )}
        </>
      )}
    </div>
  )
}

