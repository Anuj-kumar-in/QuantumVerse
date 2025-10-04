import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { blockchainService } from '../services/hedera/blockchain'
import { walletService } from '../services/hedera/wallet'

interface BlockchainState {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  account: string | null
  chainId: number | null
  blockNumber: number | null
}

interface BlockchainContextValue {
  state: BlockchainState
  refreshConnection: () => Promise<void>
  clearError: () => void
}

const BlockchainContext = createContext<BlockchainContextValue | undefined>(undefined)

interface BlockchainProviderProps {
  children: ReactNode
}

export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({ children }) => {
  const [state, setState] = useState<BlockchainState>({
    isConnected: false,
    isLoading: true,
    error: null,
    account: null,
    chainId: null,
    blockNumber: null
  })

  const refreshConnection = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const connectedAccount = walletService.getConnectedAccount()

      if (connectedAccount) {
        setState(prev => ({
          ...prev,
          isConnected: true,
          account: connectedAccount.accountId,
          chainId: 296, // Hedera testnet
          blockNumber: null, // Could fetch current block if needed
          isLoading: false
        }))
      } else {
        setState(prev => ({
          ...prev,
          isConnected: false,
          account: null,
          chainId: null,
          blockNumber: null,
          isLoading: false
        }))
      }
    } catch (error) {
      console.error('Failed to refresh blockchain connection:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message
      }))
    }
  }

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  // Initialize connection check
  useEffect(() => {
    refreshConnection()
  }, [])

  // Listen for wallet connection changes
  useEffect(() => {
    const handleWalletChange = () => {
      refreshConnection()
      blockchainService.clearContracts()
    }

    // Listen for wallet connection events
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', handleWalletChange)
      (window as any).ethereum.on('chainChanged', handleWalletChange)

      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleWalletChange)
        (window as any).ethereum.removeListener('chainChanged', handleWalletChange)
      }
    }
  }, [])

  const value: BlockchainContextValue = {
    state,
    refreshConnection,
    clearError
  }

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  )
}

export const useBlockchain = (): BlockchainContextValue => {
  const context = useContext(BlockchainContext)
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider')
  }
  return context
}

export default BlockchainContext