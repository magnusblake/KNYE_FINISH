"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowRight, Disc3, Coins, Rocket, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OnboardingProps {
  onClose: () => void
  username?: string | null
}

export function OnboardingSlides({ onClose, username }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  
  const slides = [
    {
      title: "Welcome to $KNYE",
      icon: <Coins className="w-16 h-16 text-primary mb-4" />,
      content: (
        <>
          <h2 className="text-2xl font-bold text-primary mb-4">
            {username ? `Welcome, ${username}!` : "Welcome to $KNYE!"}
          </h2>
          <p className="text-muted-foreground mb-4">
            $KNYE is the ultimate mining game on TON. Click to earn tokens, upgrade your mining power, and build wealth on the blockchain.
          </p>
          <p className="text-primary font-medium">Swipe to learn how to play →</p>
        </>
      ),
      gradient: "from-blue-500/20 to-purple-500/20"
    },
    {
      title: "Click to Earn",
      icon: <Disc3 className="w-16 h-16 text-primary mb-4" />,
      content: (
        <>
          <h2 className="text-2xl font-bold text-primary mb-4">Click & Earn</h2>
          <p className="text-muted-foreground mb-4">
            Tap the main mining button to earn $KNYE coins. The more you click, the more you earn!
          </p>
          <ul className="space-y-2 text-muted-foreground mb-4">
            <li className="flex items-center">• Purchase upgrades to boost your earnings</li>
            <li className="flex items-center">• Earn passive income while you're away</li>
            <li className="flex items-center">• Play mini-games for bonus rewards</li>
          </ul>
        </>
      ),
      gradient: "from-green-500/20 to-blue-500/20"
    },
    {
      title: "Upgrade & Grow",
      icon: <Rocket className="w-16 h-16 text-primary mb-4" />,
      content: (
        <>
          <h2 className="text-2xl font-bold text-primary mb-4">Upgrade & Grow</h2>
          <p className="text-muted-foreground mb-4">
            Spend your $KNYE on powerful upgrades to increase both your active and passive earnings.
          </p>
          <ul className="space-y-2 text-muted-foreground mb-4">
            <li className="flex items-center">• Level up your mining equipment</li>
            <li className="flex items-center">• Unlock special abilities and features</li>
            <li className="flex items-center">• Prestige to multiply all future earnings</li>
          </ul>
        </>
      ),
      gradient: "from-yellow-500/20 to-red-500/20"
    },
    {
      title: "Connect & Withdraw",
      icon: <Zap className="w-16 h-16 text-primary mb-4" />,
      content: (
        <>
          <h2 className="text-2xl font-bold text-primary mb-4">Connect & Withdraw</h2>
          <p className="text-muted-foreground mb-4">
            Connect your TON wallet to withdraw your $KNYE tokens to the blockchain.
          </p>
          <p className="text-muted-foreground mb-4">
            Invite friends to earn referral bonuses and climb the leaderboard!
          </p>
          <Button 
            onClick={() => onClose()} 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            Start Mining Now
            <ArrowRight className="w-4 h-4" />
          </Button>
        </>
      ),
      gradient: "from-purple-500/20 to-pink-500/20"
    }
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    } else {
      onClose()
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
  }
  
  // Handle touch events for swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }
  
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50) { // Swipe left - go to next slide
      nextSlide()
    } else if (diff < -50) { // Swipe right - go to previous slide
      prevSlide()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient} opacity-20`}
          />
        </AnimatePresence>
      </div>
      
      <div className="max-w-md w-full mx-auto px-6 py-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-secondary/70 backdrop-blur-lg p-6 rounded-xl shadow-lg"
          >
            <div className="flex flex-col items-center text-center">
              {slides[currentSlide].icon}
              {slides[currentSlide].content}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-6">
          <Button
            variant="ghost"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="text-muted-foreground"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full ${
                  currentSlide === index ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="ghost"
            onClick={nextSlide}
            className="text-primary"
          >
            {currentSlide < slides.length - 1 ? (
              <ChevronRight className="w-6 h-6" />
            ) : (
              <ArrowRight className="w-6 h-6" />
            )}
          </Button>
        </div>
        
        <Button
          variant="ghost"
          onClick={onClose}
          className="absolute top-2 right-2 text-muted-foreground text-xs"
        >
          Skip
        </Button>
      </div>
    </div>
  )
}