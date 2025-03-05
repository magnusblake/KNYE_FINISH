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
  
  // Генерируем реферальный код на основе Telegram username или ID
  const myReferralCode = telegramUsername || 
    (gameState.userId ? `user${gameState.userId}` : "KNYE_USER")
  
  // Полная реферальная ссылка
  const referralLink = `https://t.me/KnyeClickerBot?start=${myReferralCode}`

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  // Функция для шаринга через Telegram
  const handleShare = () => {
    if (tg && tg.shareUrl) {
      tg.shareUrl(referralLink)
    } else {
      // Fallback для использования вне Telegram
      if (navigator.share) {
        navigator.share({
          title: '$KNYE Clicker',
          text: 'Присоединяйся к игре $KNYE Clicker и получи бонус по моей реферальной ссылке!',
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
          Реферальная программа
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Поделитесь своей реферальной ссылкой и заработайте награды!</p>
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
                Поделиться
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">Введите реферальный код друга:</p>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Введите код"
                className="bg-accent border-accent"
              />
              <Button
                onClick={handleSubmitReferralCode}
                className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Применить
              </Button>
            </div>
          </div>
          
          <div className="pt-2 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Ваши рефералы:</p>
            <p className="text-lg font-medium text-primary">{gameState.referrals.length}</p>
          </div>
          
          {gameState.referrals.length > 0 && (
            <div className="bg-accent rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-2">Активные рефералы:</p>
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