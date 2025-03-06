"use client"

import { useState } from "react"
import type { GameState } from "@/hooks/useGameState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Copy, CheckCircle, Share2, ExternalLink } from "lucide-react"
import { useTelegram } from "@/hooks/useTelegram"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface ReferralProgramProps {
  gameState: GameState
  telegramUsername?: string
}

export function ReferralProgram({ gameState, telegramUsername }: ReferralProgramProps) {
  const [referralCode, setReferralCode] = useState("")
  const [copied, setCopied] = useState(false)
  const { tg } = useTelegram()
  
  // Generate referral code based on Telegram username or ID
  const myReferralCode = telegramUsername || 
    (gameState.userId ? `user${gameState.userId}` : "KNYE_USER")
  
  // Full referral link
  const referralLink = `https://t.me/KnyeClickerBot?start=${myReferralCode}`

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  // Function for sharing through Telegram
  const handleShare = () => {
    if (tg && tg.shareUrl) {
      tg.shareUrl(referralLink)
    } else {
      // Fallback for use outside Telegram
      if (navigator.share) {
        navigator.share({
          title: '$KNYE Clicker',
          text: 'Join the $KNYE Clicker game and get a bonus with my referral link!',
          url: referralLink
        })
      } else {
        handleCopyReferralCode()
      }
    }
  }

  const handleSubmitReferralCode = () => {
    if (referralCode.trim() !== "") {
      gameState.addReferral(referralCode)
      setReferralCode("")
    }
  }

  return (
    <Card className="bg-secondary border-none mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Referral Program
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Share your referral link and earn rewards!</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  value={referralLink}
                  readOnly 
                  className="bg-accent border-accent pr-12"
                />
                <Button 
                  onClick={handleCopyReferralCode} 
                  variant="ghost" 
                  className="absolute right-0 top-0 h-full px-3"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <Button 
                onClick={handleShare} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">Enter a friend's referral code:</p>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter code"
                className="bg-accent border-accent"
              />
              <Button
                onClick={handleSubmitReferralCode}
                className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Apply
              </Button>
            </div>
          </div>
          
          <div className="pt-2 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Your referrals:</p>
            <p className="text-lg font-medium text-primary">{gameState.referrals.length}</p>
          </div>
          
          {gameState.referrals.length > 0 && (
            <div className="bg-accent rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-2">Active referrals:</p>
              <ul className="space-y-1">
                {gameState.referrals.map((refCode, index) => (
                  <li key={index} className="text-xs flex justify-between">
                    <span className="text-foreground">{refCode}</span>
                    <span className="text-primary">+1,000 $KNYE</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}