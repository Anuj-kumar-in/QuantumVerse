import { useState, useEffect } from 'react'
import { walletService } from '../services/hedera/wallet'
import { WalletProvider,type  WalletConnectionState, type HederaAccount } from '../types/hedera'

export function useWallet() {
  const [connectionState, setConnectionState] = useState<WalletConnectionState>(
    walletService.getConnectionState()
  )
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    walletService.addListener(setConnectionState)
    return () => {
      walletService.removeListener(setConnectionState)
    }
  }, [])

  const connect = async (provider: WalletProvider): Promise<boolean> => {
    setIsConnecting(true)
    try {
      const success = await walletService.connectWallet(provider)
      return success
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async (): Promise<void> => {
    await walletService.disconnect()
  }

  return {
    connectionState,
    isConnecting,
    connect,
    disconnect,
    isConnected: connectionState.isConnected,
    account: connectionState.account,
    provider: connectionState.provider,
    network: connectionState.network
  }
}