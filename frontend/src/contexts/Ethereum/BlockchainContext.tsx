
import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { blockchainService } from '../../services/ethereum/blockchain'
import { walletService } from '../../services/ethereum/wallet'

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
        // Get chain ID from web3 provider
        const web3Provider = walletService.getWeb3Provider()
        const network = web3Provider ? await web3Provider.getNetwork() : null
        const blockNumber = web3Provider ? await web3Provider.getBlockNumber() : null

        setState(prev => ({
          ...prev,
          isConnected: true,
          account: connectedAccount.accountId, // Using accountId for compatibility
          chainId: network ? Number(network.chainId) : null,
          blockNumber: blockNumber,
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
      if (blockchainService && blockchainService.clearContracts) {
        blockchainService.clearContracts()
      }
    }

    // Listen for wallet connection events
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleWalletChange)
      window.ethereum.on('chainChanged', handleWalletChange)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleWalletChange)
        window.ethereum.removeListener('chainChanged', handleWalletChange)
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