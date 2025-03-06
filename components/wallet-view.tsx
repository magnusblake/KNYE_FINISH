"use client"

import { useState, useEffect } from "react"
import type { GameState } from "@/hooks/useGameState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRightIcon, WalletIcon, CheckCircle, AlertCircle, CopyIcon, QrCodeIcon, ZapIcon, DollarSign } from "lucide-react"
import { connectTonWallet, withdrawCoins, getWalletBalance } from "@/lib/wallet"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { useTelegram } from "@/hooks/useTelegram"
import { Badge } from "@/components/ui/badge"

interface WalletViewProps {
  gameState: GameState
}

export function WalletView({ gameState }: WalletViewProps) {
  const maskAddress = (address: string): string => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 5)}***${address.substring(address.length - 5)}`;
  };

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

  // Define conversion rate
  const KNYE_TO_USD_RATE = 0.0025; // 1 KNYE = $0.00025

  const MIN_WITHDRAWAL = 10000

  const handleConnect = async () => {
    setIsConnecting(true)
    setError("")

    try {
      // In Telegram WebApp we can use TON Connect or built-in Telegram Wallet
      if (tg && tg.initDataUnsafe?.user) {
        const telegramUser = tg.initDataUnsafe.user
        
        // Create pseudo-address based on Telegram ID
        // In reality this would be integration with TON Wallet via WebApp
        const simulatedAddress = `EQD...${telegramUser.id.toString().padStart(10, '0')}`;
        
        gameState.setWalletAddress(simulatedAddress)
        
        // Add experience for connecting wallet
        gameState.addExperience(50)
        
        // Notify user through Telegram UI
        showAlert("Wallet successfully connected!")
      } else {
        // Fallback for debugging outside Telegram
        const address = await connectTonWallet()
        gameState.setWalletAddress(address)
        gameState.addExperience(50)
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleWithdraw = async () => {
    const amount = Number.parseInt(withdrawAmount)

    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (amount > gameState.coins) {
      setError("Insufficient coins for withdrawal")
      return
    }

    if (amount < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal amount: ${MIN_WITHDRAWAL.toLocaleString()} $KNYE`)
      return
    }

    if (!gameState.walletAddress) {
      setError("Please connect your TON wallet")
      return
    }
    
    // Request confirmation through Telegram UI
    const confirmed = await showConfirm(`Are you sure you want to withdraw ${amount.toLocaleString()} $KNYE?`)
    
    if (!confirmed) return
    
    setWithdrawing(true)
    setError("")

    try {
      // In a real app, this would be an API request to withdraw funds
      setTimeout(async () => {
        gameState.removeCoins(amount)
        setWithdrawSuccess(true)
        setWithdrawAmount("")
        
        // Add experience for successful withdrawal
        gameState.addExperience(100)
        
        // Notify user through Telegram UI
        showAlert(`Successfully withdrawn ${amount.toLocaleString()} $KNYE!`)

        setTimeout(() => {
          setWithdrawSuccess(false)
        }, 3000)
        
        setWithdrawing(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to complete withdrawal")
      setWithdrawing(false)
    }
  }
  
  // Copy wallet address to clipboard
  const handleCopyAddress = () => {
    if (gameState.walletAddress) {
      navigator.clipboard.writeText(gameState.walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  // Set maximum amount for withdrawal
  const handleSetMaxAmount = () => {
    setWithdrawAmount(Math.floor(gameState.coins).toString())
  }

  useEffect(() => {
    const fetchWalletData = async () => {
      setIsLoading(true)
      if (gameState.walletAddress) {
        try {
          // Simulate getting wallet balance
          // In a real app, this would be an API request
          setWalletBalance(Math.random() * 5 + 0.1)
        } catch (error) {
          console.error("Failed to get wallet balance", error)
          setWalletBalance(null)
        }
      }
      setIsLoading(false)
    }
    
    fetchWalletData()
    
    // Update wallet data every 30 seconds
    const interval = setInterval(fetchWalletData, 30000)
    
    return () => clearInterval(interval)
  }, [gameState.walletAddress])

  // Calculate USD value
  const usdValue = Math.floor(gameState.coins * KNYE_TO_USD_RATE).toString();

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold mb-1 text-primary">TON Wallet</h2>
      <p className="text-muted-foreground mb-4">Connect your TON wallet to withdraw $KNYE</p>

      <Card className="bg-secondary border-none mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-primary" />
            Your Wallet
          </CardTitle>
          <CardDescription>
            Connect your TON wallet to manage and withdraw your $KNYE
          </CardDescription>
        </CardHeader>

        <CardContent>
          {gameState.walletAddress ? (
            <div className="bg-accent p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground font-medium">Connected wallet:</div>
                  <div className="text-primary text-sm break-all flex items-center justify-between">
                    <span className="mr-2">{maskAddress(gameState.walletAddress)}</span>
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
                    </div>
                  </div>
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
                  Connecting...
                </>
              ) : (
                "Connect TON Wallet"
              )}
            </Button>
          )}

          {error && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

          {error && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {gameState.walletAddress && (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="withdraw" className="flex-1 flex items-center justify-center gap-2">
              <ArrowRightIcon className="w-4 h-4" />
              Withdraw
            </TabsTrigger>
            <TabsTrigger value="boost" className="flex-1 flex items-center justify-center gap-2">
              <ZapIcon className="w-4 h-4" />
              Boost
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="withdraw">
            <Card className="bg-secondary border-none">
              <CardHeader>
                <CardTitle>Withdraw $KNYE</CardTitle>
                <CardDescription>Convert your $KNYE to TON tokens</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="bg-accent p-3 rounded-lg mb-4">
                  <div className="text-sm text-muted-foreground mb-1">Available balance:</div>
                  <div className="flex items-center text-2xl font-bold text-primary">
                    {Math.floor(gameState.coins).toLocaleString()} $KNYE
                    <Badge variant="outline" className="ml-2 bg-background text-muted-foreground text-xs">
                      <DollarSign className="w-3 h-3 mr-0.5" />
                      {usdValue}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Amount to withdraw"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value.replace(/^0+/, ""))}
                    className="bg-accent border-accent text-primary"
                  />
                  <Button onClick={handleSetMaxAmount} variant="outline" className="shrink-0">
                    Max
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  Minimum withdrawal amount: {MIN_WITHDRAWAL.toLocaleString()} $KNYE
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
                      Processing...
                    </>
                  ) : (
                    <>
                      Withdraw $KNYE
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
                  <AlertTitle className="text-green-500">Success</AlertTitle>
                  <AlertDescription className="text-green-500/80">
                    Withdrawal successfully processed!
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="boost">
            <Card className="bg-secondary border-none">
              <CardHeader>
                <CardTitle>Boost Your Mining</CardTitle>
                <CardDescription>Spend TON to instantly increase your $KNYE earnings</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-accent p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Small Boost</h4>
                      <p className="text-sm text-muted-foreground">+5,000 $KNYE instantly</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <Button 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => {
                          gameState.addCoins(5000)
                          showAlert("Received +5,000 $KNYE!")
                        }}
                      >
                        0.1 TON
                      </Button>
                      <span className="text-xs text-muted-foreground mt-1">≈ ${Math.floor(5000 * KNYE_TO_USD_RATE)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-accent p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Medium Boost</h4>
                      <p className="text-sm text-muted-foreground">+25,000 $KNYE instantly</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <Button 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => {
                          gameState.addCoins(25000)
                          showAlert("Received +25,000 $KNYE!")
                        }}
                      >
                        0.5 TON
                      </Button>
                      <span className="text-xs text-muted-foreground mt-1">≈ ${Math.floor(25000 * KNYE_TO_USD_RATE)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-accent p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Large Boost</h4>
                      <p className="text-sm text-muted-foreground">+100,000 $KNYE instantly</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <Button 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => {
                          gameState.addCoins(100000)
                          showAlert("Received +100,000 $KNYE!")
                        }}
                      >
                        1.5 TON
                      </Button>
                      <span className="text-xs text-muted-foreground mt-1">≈ ${Math.floor(100000 * KNYE_TO_USD_RATE)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex-col">
                <p className="text-sm text-muted-foreground mb-2 text-center w-full">
                  Note: This is a simulation. In a real app, these would be actual TON transactions.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}