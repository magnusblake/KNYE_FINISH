"use client"

import { useState, useEffect } from "react"
import type { GameState } from "@/hooks/useGameState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRightIcon, WalletIcon, CheckCircle, AlertCircle } from "lucide-react"
import { connectTonWallet, withdrawCoins, getWalletBalance } from "@/lib/wallet"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface WalletViewProps {
  gameState: GameState
}

export function WalletView({ gameState }: WalletViewProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)

  const MIN_WITHDRAWAL = 10000

  const handleConnect = async () => {
    setIsConnecting(true)
    setError("")

    try {
      const address = await connectTonWallet()
      gameState.setWalletAddress(address)
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
      setError("Not enough coins to withdraw")
      return
    }

    if (amount < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal is ${MIN_WITHDRAWAL.toLocaleString()} $KNYE`)
      return
    }

    if (!gameState.walletAddress) {
      setError("Please connect your TON wallet first")
      return
    }

    setWithdrawing(true)
    setError("")

    try {
      const result = await withdrawCoins(gameState.walletAddress, amount)
      if (result.success) {
        gameState.removeCoins(amount)
        setWithdrawSuccess(true)
        setWithdrawAmount("")

        setTimeout(() => {
          setWithdrawSuccess(false)
        }, 3000)
      } else {
        throw new Error("Withdrawal failed")
      }
    } catch (err: any) {
      setError(err.message || "Failed to withdraw coins")
    } finally {
      setWithdrawing(false)
    }
  }

  useEffect(() => {
    if (gameState.walletAddress) {
      getWalletBalance(gameState.walletAddress).then((balance) => {
        // You can add this balance to your game state if needed
        console.log("Wallet balance:", balance)
      })
    }
  }, [gameState.walletAddress])

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-1 text-primary">TON Wallet</h2>
      <p className="text-muted-foreground mb-6">Connect your TON wallet to withdraw $KNYE</p>

      <div className="bg-secondary p-5 rounded-lg mb-6">
        <div className="flex items-center gap-3 mb-4">
          <WalletIcon className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-bold text-primary">Your Wallet</h3>
        </div>

        {gameState.walletAddress ? (
          <div className="bg-accent p-3 rounded-lg mb-4">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-muted-foreground font-medium">Connected:</div>
                <div className="text-primary text-sm break-all">{gameState.walletAddress}</div>
              </div>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isConnecting ? "Connecting..." : "Connect TON Wallet"}
          </Button>
        )}

        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="bg-secondary p-5 rounded-lg">
        <h3 className="text-lg font-bold mb-4 text-primary">Withdraw $KNYE</h3>

        <div className="bg-accent p-3 rounded-lg mb-4">
          <div className="text-sm text-muted-foreground mb-1">Available Balance:</div>
          <div className="text-2xl font-bold text-primary">{gameState.coins.toLocaleString()} $KNYE</div>
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
          <Button onClick={() => setWithdrawAmount(gameState.coins.toString())} variant="outline" className="shrink-0">
            Max
          </Button>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          Minimum withdrawal: {MIN_WITHDRAWAL.toLocaleString()} $KNYE
        </div>

        <Button
          onClick={handleWithdraw}
          disabled={withdrawing || gameState.coins < MIN_WITHDRAWAL || !gameState.walletAddress}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
        >
          {withdrawing ? "Processing..." : "Withdraw $KNYE"}
          {!withdrawing && <ArrowRightIcon className="w-4 h-4" />}
        </Button>

        {!gameState.walletAddress && (
          <Alert className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wallet not connected</AlertTitle>
            <AlertDescription>Please connect your TON wallet to withdraw $KNYE.</AlertDescription>
          </Alert>
        )}

        {withdrawSuccess && (
          <Alert variant="success" className="mt-3">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Withdrawal successful!</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}

