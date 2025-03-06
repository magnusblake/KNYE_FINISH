"use client"

import { useState, useEffect } from "react"
import type { GameState } from "@/hooks/useGameState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRightIcon, WalletIcon, CheckCircle, AlertCircle, CopyIcon, QrCodeIcon, ZapIcon } from "lucide-react"
import { connectTonWallet, withdrawCoins, getWalletBalance } from "@/lib/wallet"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { useTelegram } from "@/hooks/useTelegram"

interface WalletViewProps {
  gameState: GameState
}

export function WalletView({ gameState }: WalletViewProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("withdraw")
  const [copied, setCopied] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const { tg, showAlert, showConfirm } = useTelegram()

  const MIN_WITHDRAWAL = 10000

  const handleConnect = async () => {
    setIsConnecting(true)
    setError("")

    try {
      // В Telegram WebApp можем использовать TON Connect или встроенный Telegram Wallet
      if (tg && tg.initDataUnsafe?.user) {
        const telegramUser = tg.initDataUnsafe.user
        
        // Создаем псевдо-адрес на основе Telegram ID пользователя
        // В реальности здесь должна быть интеграция с TON Wallet через WebApp
        const simulatedAddress = `EQD...${telegramUser.id.toString().padStart(10, '0')}`;
        
        gameState.setWalletAddress(simulatedAddress)
        
        // Пример того, как это могло бы выглядеть с TON Connect
        // const address = await connectTonWallet()
        // gameState.setWalletAddress(address)
        
        // Добавляем опыт за подключение кошелька
        gameState.addExperience(50)
        
        // Уведомление пользователя через Telegram UI
        showAlert("Кошелек успешно подключен!")
      } else {
        // Fallback для отладки вне Telegram
        const address = await connectTonWallet()
        gameState.setWalletAddress(address)
        gameState.addExperience(50)
      }
    } catch (err: any) {
      setError(err.message || "Не удалось подключить кошелек")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleWithdraw = async () => {
    const amount = Number.parseInt(withdrawAmount)

    if (isNaN(amount) || amount <= 0) {
      setError("Пожалуйста, введите корректную сумму")
      return
    }

    if (amount > gameState.coins) {
      setError("Недостаточно монет для вывода")
      return
    }

    if (amount < MIN_WITHDRAWAL) {
      setError(`Минимальная сумма вывода: ${MIN_WITHDRAWAL.toLocaleString()} $KNYE`)
      return
    }

    if (!gameState.walletAddress) {
      setError("Пожалуйста, подключите TON кошелек")
      return
    }
    
    // Запрашиваем подтверждение через Telegram UI
    const confirmed = await showConfirm(`Вы уверены, что хотите вывести ${amount.toLocaleString()} $KNYE?`)
    
    if (!confirmed) return
    
    setWithdrawing(true)
    setError("")

    try {
      // В реальном приложении здесь был бы запрос к API для вывода средств
      setTimeout(async () => {
        gameState.removeCoins(amount)
        setWithdrawSuccess(true)
        setWithdrawAmount("")
        
        // Добавляем опыт за успешный вывод
        gameState.addExperience(100)
        
        // Уведомляем пользователя через Telegram UI
        showAlert(`Успешно выведено ${amount.toLocaleString()} $KNYE!`)

        setTimeout(() => {
          setWithdrawSuccess(false)
        }, 3000)
        
        setWithdrawing(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Не удалось выполнить вывод")
      setWithdrawing(false)
    }
  }
  
  // Копирование адреса кошелька в буфер обмена
  const handleCopyAddress = () => {
    if (gameState.walletAddress) {
      navigator.clipboard.writeText(gameState.walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  // Установка максимальной суммы для вывода
  const handleSetMaxAmount = () => {
    setWithdrawAmount(Math.floor(gameState.coins).toString())
  }

  useEffect(() => {
    const fetchWalletData = async () => {
      setIsLoading(true)
      if (gameState.walletAddress) {
        try {
          // Симуляция получения баланса кошелька
          // В реальном приложении здесь был бы запрос к API
          setWalletBalance(Math.random() * 5 + 0.1)
        } catch (error) {
          console.error("Не удалось получить баланс кошелька", error)
          setWalletBalance(null)
        }
      }
      setIsLoading(false)
    }
    
    fetchWalletData()
    
    // Обновление данных кошелька каждые 30 секунд
    const interval = setInterval(fetchWalletData, 30000)
    
    return () => clearInterval(interval)
  }, [gameState.walletAddress])

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-1 text-primary">TON Кошелек</h2>
      <p className="text-muted-foreground mb-6">Подключите TON кошелек, чтобы выводить $KNYE</p>

      <Card className="bg-secondary border-none mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-primary" />
            Ваш кошелек
          </CardTitle>
          <CardDescription>
            Подключите TON кошелек, чтобы управлять и выводить ваши $KNYE
          </CardDescription>
        </CardHeader>

        <CardContent>
          {gameState.walletAddress ? (
            <div className="bg-accent p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground font-medium">Подключенный кошелек:</div>
                  <div className="text-primary text-sm break-all flex items-center justify-between">
                    <span className="mr-2">{gameState.walletAddress}</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={handleCopyAddress}
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <CopyIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => setShowQRCode(!showQRCode)}
                      >
                        <QrCodeIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {showQRCode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 bg-background p-4 rounded-lg overflow-hidden"
                      >
                        <div className="flex justify-center">
                          {/* Placeholder for QR code - in a real app you would generate it */}
                          <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded flex items-center justify-center">
                            <span className="text-xs text-muted-foreground text-center">
                              QR Code<br />placeholder
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {walletBalance !== null && (
                    <div className="mt-2 text-sm flex">
                      <span className="text-muted-foreground">Баланс TON:</span>
                      <span className="text-primary ml-2">{walletBalance.toLocaleString()} TON</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isConnecting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Подключение...
                </>
              ) : (
                "Подключить TON Кошелек"
              )}
            </Button>
          )}

          {error && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ошибка</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {gameState.walletAddress && (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <ArrowRightIcon className="w-4 h-4" />
              Вывод
            </TabsTrigger>
            <TabsTrigger value="boost" className="flex items-center gap-2">
              <ZapIcon className="w-4 h-4" />
              Буст
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="withdraw">
            <Card className="bg-secondary border-none">
              <CardHeader>
                <CardTitle>Вывод $KNYE</CardTitle>
                <CardDescription>Конвертируйте ваши $KNYE в TON токены</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="bg-accent p-3 rounded-lg mb-4">
                  <div className="text-sm text-muted-foreground mb-1">Доступный баланс:</div>
                  <div className="text-2xl font-bold text-primary">{gameState.coins.toLocaleString()} $KNYE</div>
                </div>

                <div className="flex gap-2 mb-4">
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Сумма для вывода"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value.replace(/^0+/, ""))}
                    className="bg-accent border-accent text-primary"
                  />
                  <Button onClick={handleSetMaxAmount} variant="outline" className="shrink-0">
                    Макс
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  Минимальная сумма вывода: {MIN_WITHDRAWAL.toLocaleString()} $KNYE
                </div>
              </CardContent>
              
              <CardFooter>
                <Button
                  onClick={handleWithdraw}
                  disabled={withdrawing || gameState.coins < MIN_WITHDRAWAL || !gameState.walletAddress}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
                >
                  {withdrawing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                      Обработка...
                    </>
                  ) : (
                    <>
                      Вывести $KNYE
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {withdrawSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4"
              >
                <Alert className="border-green-500 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-500">Успех</AlertTitle>
                  <AlertDescription className="text-green-500/80">
                    Вывод успешно обработан!
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="boost">
            <Card className="bg-secondary border-none">
              <CardHeader>
                <CardTitle>Ускорьте свой майнинг</CardTitle>
                <CardDescription>Потратьте TON, чтобы мгновенно увеличить свою добычу $KNYE</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-accent p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Малый буст</h4>
                      <p className="text-sm text-muted-foreground">+5,000 $KNYE мгновенно</p>
                    </div>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => {
                        gameState.addCoins(5000)
                        showAlert("Получено +5,000 $KNYE!")
                      }}
                    >
                      0.1 TON
                    </Button>
                  </div>
                  
                  <div className="bg-accent p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Средний буст</h4>
                      <p className="text-sm text-muted-foreground">+25,000 $KNYE мгновенно</p>
                    </div>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => {
                        gameState.addCoins(25000)
                        showAlert("Получено +25,000 $KNYE!")
                      }}
                    >
                      0.5 TON
                    </Button>
                  </div>
                  
                  <div className="bg-accent p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Большой буст</h4>
                      <p className="text-sm text-muted-foreground">+100,000 $KNYE мгновенно</p>
                    </div>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => {
                        gameState.addCoins(100000)
                        showAlert("Получено +100,000 $KNYE!")
                      }}
                    >
                      1.5 TON
                    </Button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex-col">
                <p className="text-sm text-muted-foreground mb-2 text-center w-full">
                  Примечание: Это симуляция. В реальном приложении это были бы настоящие транзакции TON.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}