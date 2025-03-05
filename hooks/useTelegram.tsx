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
  showAlert: (message: string) => void
  showConfirm: (message: string) => Promise<boolean>
  closeTelegram: () => void
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
  showAlert: () => {},
  showConfirm: () => Promise.resolve(false),
  closeTelegram: () => {}
}

const TelegramContext = createContext<TelegramContext>(defaultContext)

export const useTelegram = () => useContext(TelegramContext)

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const [tg, setTg] = useState<TelegramWebApp | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [user, setUser] = useState({
    id: null as number | null,
    username: null as string | null,
    firstName: null as string | null,
    lastName: null as string | null
  })

  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window !== 'undefined') {
      const telegram = window.Telegram?.WebApp
      
      if (telegram) {
        // Configure Telegram WebApp
        telegram.ready()
        telegram.expand()
        
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
        
        setTg(telegram)
        setIsReady(true)
        
        // Log initialization
        console.log('Telegram WebApp initialized')
      } else {
        console.warn('Telegram WebApp is not available. Running in standalone mode.')
        // When running outside Telegram, we still want the app to work
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

  const contextValue: TelegramContext = {
    tg,
    user,
    isReady,
    showAlert,
    showConfirm,
    closeTelegram
  }

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  )
}