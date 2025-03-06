"use client"

import { useEffect, useState, createContext, useContext } from 'react'
import type { TelegramWebApp } from '@/app/telegram-webapp'

// Context for Telegram WebApp
interface TelegramContext {
  tg: TelegramWebApp | null
  user: {
    id: number | null
    username: string | null
    firstName: string | null
    lastName: string | null
  }
  isReady: boolean
  isInTelegram: boolean // Added to explicitly check if running in Telegram
  showAlert: (message: string) => void
  showConfirm: (message: string) => Promise<boolean>
  closeTelegram: () => void
  shareUrl: (url: string) => void // Added to improve sharing functionality
}

const defaultContext: TelegramContext = {
  tg: null,
  user: {
    id: null,
    username: null, 
    firstName: null,
    lastName: null
  },
  isReady: false,
  isInTelegram: false,
  showAlert: () => {},
  showConfirm: () => Promise.resolve(false),
  closeTelegram: () => {},
  shareUrl: () => {}
}

const TelegramContext = createContext<TelegramContext>(defaultContext)

export const useTelegram = () => useContext(TelegramContext)

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [tg, setTg] = useState<TelegramWebApp | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isInTelegram, setIsInTelegram] = useState(false)
  const [user, setUser] = useState({
    id: null as number | null,
    username: null as string | null,
    firstName: null as string | null,
    lastName: null as string | null
  })

  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window !== 'undefined') {
      try {
        const telegram = window.Telegram?.WebApp
        
        if (telegram) {
          // Configure Telegram WebApp
          telegram.ready()
          telegram.expand()
          setIsInTelegram(true)
          
          // Set theme to match our black/white design
          if (telegram.setHeaderColor) {
            telegram.setHeaderColor('#000000')
          }
          
          if (telegram.setBackgroundColor) {
            telegram.setBackgroundColor('#000000')
          }
          
          // Extract user info if available
          if (telegram.initDataUnsafe?.user) {
            const telegramUser = telegram.initDataUnsafe.user
            setUser({
              id: telegramUser.id,
              username: telegramUser.username || null,
              firstName: telegramUser.first_name || null,
              lastName: telegramUser.last_name || null
            })
          }
          
          // Check if we got valid init data - this confirms we're in the Telegram app
          if (telegram.initData && telegram.initData.length > 0) {
            console.log('Telegram WebApp initialized with valid init data')
          } else {
            console.warn('Running in Telegram, but no valid init data')
          }
          
          setTg(telegram)
          setIsReady(true)
          
          // Log initialization
          console.log('Telegram WebApp initialized')
        } else {
          console.warn('Telegram WebApp is not available. Running in standalone mode.')
          // When running outside Telegram, we still want the app to work for development
          setIsInTelegram(false)
          setIsReady(true)
        }
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error)
        setIsInTelegram(false)
        setIsReady(true)
      }
    }
  }, [])

  // Utility function to show alerts through Telegram UI
  const showAlert = (message: string) => {
    if (tg && tg.showAlert) {
      tg.showAlert(message)
    } else {
      alert(message)
    }
  }
  
  // Utility function to show confirmation dialogs
  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (tg && tg.showConfirm) {
        tg.showConfirm(message, (confirmed) => {
          resolve(confirmed)
        })
      } else {
        resolve(window.confirm(message))
      }
    })
  }
  
  // Close Telegram WebApp
  const closeTelegram = () => {
    if (tg) {
      tg.close()
    }
  }
  
  // Share URL using Telegram's native sharing or fallback to Web Share API
  const shareUrl = (url: string) => {
    if (tg && tg.shareUrl) {
      tg.shareUrl(url)
    } else if (navigator.share) {
      navigator.share({
        url: url,
        title: '$KNYE Clicker',
        text: 'Join the $KNYE Clicker game!'
      }).catch(err => console.error('Error sharing:', err))
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url)
      showAlert('URL copied to clipboard')
    }
  }

  const contextValue: TelegramContext = {
    tg,
    user,
    isReady,
    isInTelegram,
    showAlert,
    showConfirm,
    closeTelegram,
    shareUrl
  }

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  )
}