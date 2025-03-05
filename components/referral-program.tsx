"use client"

import { useState } from "react"
import type { GameState } from "@/hooks/useGameState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Copy, CheckCircle } from "lucide-react"

interface ReferralProgramProps {
  gameState: GameState
}

export function ReferralProgram({ gameState }: ReferralProgramProps) {
  const [referralCode, setReferralCode] = useState("")
  const [copied, setCopied] = useState(false)

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText("YOUR_REFERRAL_CODE_HERE")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitReferralCode = () => {
    if (referralCode.trim() !== "") {
      gameState.addReferral(referralCode)
      setReferralCode("")
    }
  }

  return (
    <div className="bg-secondary p-4 rounded-lg mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-bold text-primary">Referral Program</h3>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">Share your referral code and earn rewards!</p>
        <div className="flex gap-2">
          <Input value="YOUR_REFERRAL_CODE_HERE" readOnly className="bg-accent border-accent" />
          <Button onClick={handleCopyReferralCode} variant="outline" className="shrink-0">
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Enter a friend's referral code:</p>
        <div className="flex gap-2">
          <Input
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="Enter referral code"
            className="bg-accent border-accent"
          />
          <Button
            onClick={handleSubmitReferralCode}
            className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Submit
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-muted-foreground">Your referrals: {gameState.referrals.length}</p>
      </div>
    </div>
  )
}

