
import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { 
  type EthereumConfig, 
  EthereumNetwork, 
  type WalletConnectionState, 
  type EthereumAccount,
  WalletProvider 
} from '../../types/ethereum'
import { initializeHederaClient, getHederaClient } from '../../services/ethereum/client'
import { walletService } from '../../services/ethereum/wallet'

// Keep interface names for frontend compatibility
interface HederaState {
  isInitialized: boolean 
  isConnecting: boolean
  wallet: WalletConnectionState
  config: EthereumConfig
  error: string | null
}

type HederaAction =
  | { type: 'INITIALIZE_START' }
  | { type: 'INITIALIZE_SUCCESS'; payload: EthereumConfig }
  | { type: 'INITIALIZE_ERROR'; payload: string }
  | { type: 'WALLET_CONNECT_START' }
  | { type: 'WALLET_CONNECT_SUCCESS'; payload: WalletConnectionState }
  | { type: 'WALLET_CONNECT_ERROR'; payload: string }
  | { type: 'WALLET_DISCONNECT' }
  | { type: 'UPDATE_ACCOUNT'; payload: EthereumAccount }
  | { type: 'CLEAR_ERROR' }


//tracking state of connection with blockchain
const initialState: HederaState = {
  isInitialized: false,
  isConnecting: false,
  wallet: {
    isConnected: false,
    account: null,
    provider: null,
    network: EthereumNetwork.SEPOLIA
  },
  config: {
    network: EthereumNetwork.SEPOLIA,
    rpcUrl: import.meta.env.VITE_RPC_URL || 'https://sepolia.infura.io/v3/',
    infuraProjectId: import.meta.env.VITE_INFURA_PROJECT_ID
  },
  error: null
}

//Outpuct according Hedera action
function hederaReducer(state: HederaState, action: HederaAction): HederaState {
  switch (action.type) {
    case 'INITIALIZE_START':
      return {
        ...state,
        isInitialized: false,
        error: null
      }

    case 'INITIALIZE_SUCCESS':
      return {
        ...state,
        isInitialized: true,
        config: action.payload,
        error: null
      }

    case 'INITIALIZE_ERROR':
      return {
        ...state,
        isInitialized: false,
        error: action.payload
      }

    case 'WALLET_CONNECT_START':
      return {
        ...state,
        isConnecting: true,
        error: null
      }

    case 'WALLET_CONNECT_SUCCESS':
      return {
        ...state,
        isConnecting: false,
        wallet: action.payload,
        error: null
      }

    case 'WALLET_CONNECT_ERROR':
      return {
        ...state,
        isConnecting: false,
        error: action.payload
      }

    case 'WALLET_DISCONNECT':
      return {
        ...state,
        wallet: {
          isConnected: false,
          account: null,
          provider: null,
          network: state.wallet.network
        },
        error: null
      }

    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        wallet: {
          ...state.wallet,
          account: action.payload
        }
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }

    default:
      return state
  }
}

interface HederaContextType {
  isInitialized: boolean
  state: HederaState
  connectWallet: (provider: WalletProvider) => Promise<boolean>
  disconnectWallet: () => Promise<void>
  refreshAccount: () => Promise<void>
  clearError: () => void
}

export const HederaContext = createContext<HederaContextType | undefined>(undefined)

interface HederaProviderProps {
  children: ReactNode
}

export function HederaProvider({ children }: HederaProviderProps) {
  const [state, dispatch] = useReducer(hederaReducer, initialState)

  useEffect(() => {
    initializeEthereum()
  }, [])

  useEffect(() => {
    // Listen to wallet connection changes
    walletService.addListener(handleWalletStateChange)

    return () => {
      walletService.removeListener(handleWalletStateChange)
    }
  }, [])


  //Function for initializing Ethereum network
  const initializeEthereum = async () => {
    console.log('🔄 Starting Ethereum initialization...')
    dispatch({ type: 'INITIALIZE_START' })

    try {
      const config: EthereumConfig = {
        network: (import.meta.env.VITE_ETHEREUM_NETWORK as EthereumNetwork) || EthereumNetwork.SEPOLIA,
        privateKey: import.meta.env.VITE_ETHEREUM_PRIVATE_KEY,
        rpcUrl: import.meta.env.VITE_RPC_URL || 'https://sepolia.infura.io/v3/',
        infuraProjectId: import.meta.env.VITE_INFURA_PROJECT_ID
      }
      console.log('📋 Ethereum config:', { ...config, privateKey: config.privateKey ? '[HIDDEN]' : undefined })

      // Initialize Ethereum client
      console.log('🔧 Initializing Ethereum client...')
      initializeHederaClient(config)

      // Validate connection
      console.log('🔍 Validating Ethereum connection...')
      const client = getHederaClient()
      const isValid = await client.validateConnection()
      console.log('🔍 Connection validation result:', isValid)

      if (!isValid) {
        throw new Error('Failed to establish connection to Ethereum network')
      }

      dispatch({ type: 'INITIALIZE_SUCCESS', payload: config })
      console.log('✅ Ethereum initialized successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      dispatch({ type: 'INITIALIZE_ERROR', payload: errorMessage })
      console.error('❌ Ethereum initialization failed:', error)
    }
  }

  const handleWalletStateChange = (walletState: WalletConnectionState) => {
    dispatch({ type: 'WALLET_CONNECT_SUCCESS', payload: walletState })
  }

  const connectWallet = async (provider: WalletProvider): Promise<boolean> => {
    dispatch({ type: 'WALLET_CONNECT_START' })

    try {
      const success = await walletService.connectWallet(provider)

      if (success) {
        const connectionState = walletService.getConnectionState()
        dispatch({ type: 'WALLET_CONNECT_SUCCESS', payload: connectionState })
        console.log(`✅ Connected to ${provider}`)
        return true
      } else {
        throw new Error(`Failed to connect to ${provider}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Wallet connection failed'
      dispatch({ type: 'WALLET_CONNECT_ERROR', payload: errorMessage })
      console.error('❌ Wallet connection failed:', error)
      return false
    }
  }

  const disconnectWallet = async (): Promise<void> => {
    try {
      await walletService.disconnect()
      dispatch({ type: 'WALLET_DISCONNECT' })
      console.log('✅ Wallet disconnected')
    } catch (error) {
      console.error('❌ Wallet disconnect failed:', error)
    }
  }

  const refreshAccount = async (): Promise<void> => {
    try {
      if (!state.wallet.isConnected || !state.wallet.account) {
        return
      }

      const client = getHederaClient()
      const updatedAccount = await client.getAccountInfo(state.wallet.account.accountId)
      dispatch({ type: 'UPDATE_ACCOUNT', payload: updatedAccount })
    } catch (error) {
      console.error('❌ Failed to refresh account:', error)
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const contextValue: HederaContextType = {
    isInitialized: state.isInitialized,
    state,
    connectWallet,
    disconnectWallet,
    refreshAccount,
    clearError
  }

  return (
    <HederaContext.Provider value={contextValue}>
      {children}
    </HederaContext.Provider>
  )
}

export function useHedera(): HederaContextType {
  const context = useContext(HederaContext)
  if (context === undefined) {
    throw new Error('useHedera must be used within a HederaProvider')
  }
  return context
}

// Additional hooks for convenience (keeping same names for compatibility)
export function useWallet(): WalletConnectionState {
  const { state } = useHedera()
  return state.wallet
}

export function useAccount(): EthereumAccount | null {
  const { state } = useHedera()
  return state.wallet.account
}

export function useHederaConfig(): EthereumConfig {
  const { state } = useHedera()
  return state.config
}