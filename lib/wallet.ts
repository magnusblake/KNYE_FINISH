// Simulated wallet connection function
export async function connectTonWallet(): Promise<string> {
  // Simulate a delay for the connection process
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Generate a mock wallet address
  const mockAddress =
    "EQA" +
    Array(44)
      .fill(0)
      .map(() => Math.random().toString(36)[2])
      .join("")

  return mockAddress
}

// Simulated withdrawal function
export async function withdrawCoins(
  walletAddress: string,
  amount: number,
): Promise<{ success: boolean; txId: string }> {
  // Simulate a delay for the withdrawal process
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Generate a mock transaction ID
  const mockTxId =
    "tx_" +
    Array(32)
      .fill(0)
      .map(() => Math.random().toString(36)[2])
      .join("")

  return {
    success: true,
    txId: mockTxId,
  }
}

// Simulated function to get wallet balance
export async function getWalletBalance(walletAddress: string): Promise<number> {
  // Simulate a delay for fetching the balance
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return a random balance between 0 and 10000
  return Math.floor(Math.random() * 10000)
}

