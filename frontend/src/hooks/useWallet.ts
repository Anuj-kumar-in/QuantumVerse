import { useState, useEffect } from 'react'
import { walletService } from '../services/ethereum/wallet'
import { WalletProvider, type WalletConnectionState, type EthereumAccount } from '../types/ethereum'

// Keep the same export name for frontend compatibility
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

  const switchNetwork = async (network: string): Promise<boolean> => {
    try {
      // Map network names to Ethereum networks
      const networkMap: { [key: string]: any } = {
        'mainnet': 'mainnet',
        'sepolia': 'sepolia', 
        'goerli': 'goerli',
        'localhost': 'localhost'
      }
      
      if (walletService.switchNetwork && networkMap[network.toLowerCase()]) {
        return await walletService.switchNetwork(networkMap[network.toLowerCase()])
      }
      return false
    } catch (error) {
      console.error('Failed to switch network:', error)
      return false
    }
  }

  const signMessage = async (message: string): Promise<string | null> => {
    try {
      if (walletService.signMessage) {
        return await walletService.signMessage(message)
      }
      return null
    } catch (error) {
      console.error('Failed to sign message:', error)
      return null
    }
  }

  const getBalance = async (): Promise<string | null> => {
    try {
      if (connectionState.account) {
        // Balance is already available in the account object
        return connectionState.account.balance
      }
      return null
    } catch (error) {
      console.error('Failed to get balance:', error)
      return null
    }
  }

  const getChainId = (): number => {
    switch (connectionState.network) {
      case 'mainnet': return 1
      case 'sepolia': return 11155111
      case 'goerli': return 5
      case 'localhost': return 1337
      default: return 11155111 // Default to Sepolia
    }
  }

  return {
    connectionState,
    isConnecting,
    connect,
    disconnect,
    switchNetwork,
    signMessage,
    getBalance,
    isConnected: connectionState.isConnected,
    account: connectionState.account,
    provider: connectionState.provider,
    network: connectionState.network,
    
    // Additional Ethereum-specific properties
    chainId: getChainId(),
    address: connectionState.account?.accountId || null, // Ethereum address
    balance: connectionState.account?.balance || '0',
    
    // Helper functions for better DX
    isMainnet: connectionState.network === 'mainnet',
    isTestnet: ['sepolia', 'goerli', 'localhost'].includes(connectionState.network),
    networkName: connectionState.network,
    
    // Web3 provider access for advanced usage
    getWeb3Provider: () => walletService.getWeb3Provider?.() || null,
    
    // Connection status helpers
    isMetaMask: connectionState.provider === WalletProvider.METAMASK,
    isWalletConnect: connectionState.provider === WalletProvider.WALLETCONNECT,
    isCoinbase: connectionState.provider === WalletProvider.COINBASE,
  }
}

// Additional hook for backward compatibility with existing code that might use HederaAccount type
export function useHederaWallet() {
  return useWallet()
}

// Specialized hook for account information
export function useAccount(): EthereumAccount | null {
  const { account } = useWallet()
  return account
}

// Network-specific hook
export function useNetwork() {
  const { network, chainId, isMainnet, isTestnet, switchNetwork } = useWallet()
  
  return {
    network,
    chainId,
    isMainnet,
    isTestnet,
    networkName: network,
    switchNetwork,
    
    // Network detection helpers
    isSepolia: network === 'sepolia',
    isGoerli: network === 'goerli',
    isLocalhost: network === 'localhost',
    
    // Chain ID helpers
    getChainId: () => chainId,
    isValidNetwork: () => ['mainnet', 'sepolia', 'goerli', 'localhost'].includes(network)
  }
}

// Connection status hook
export function useWalletConnection() {
  const { 
    isConnected, 
    isConnecting, 
    connect, 
    disconnect, 
    provider,
    connectionState 
  } = useWallet()
  
  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    provider,
    connectionState,
    
    // Status helpers
    canConnect: !isConnected && !isConnecting,
    canDisconnect: isConnected && !isConnecting,
    
    // Provider availability checks
    hasMetaMask: typeof window !== 'undefined' && window.ethereum?.isMetaMask,
    hasWalletConnect: true, // WalletConnect is always available
    hasCoinbase: typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet,
    
    // Quick connect functions
    connectMetaMask: () => connect(WalletProvider.METAMASK),
    connectWalletConnect: () => connect(WalletProvider.WALLETCONNECT),
    connectCoinbase: () => connect(WalletProvider.COINBASE),
  }
}
