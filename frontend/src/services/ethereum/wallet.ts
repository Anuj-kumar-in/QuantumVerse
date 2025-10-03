
import { ethers } from 'ethers'
import {
  type WalletConnectionState,
  WalletProvider,
  EthereumNetwork,
  type EthereumAccount
} from '../../types/ethereum'

// MetaMask interface
declare global {
  interface Window {
    ethereum?: any
  }
}

export class WalletService { // Keep name for frontend compatibility
  private connectionState: WalletConnectionState = {
    isConnected: false,
    account: null,
    provider: null,
    network: EthereumNetwork.SEPOLIA
  }

  private listeners: Array<(state: WalletConnectionState) => void> = []

  public addListener(callback: (state: WalletConnectionState) => void): void {
    this.listeners.push(callback)
  }

  public removeListener(callback: (state: WalletConnectionState) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback)
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.connectionState))
  }

  public async connectWallet(provider: WalletProvider): Promise<boolean> {
    console.log(`WalletService.connectWallet called with provider: "${provider}" (type: ${typeof provider})`)
    try {
      switch (provider) {
        case WalletProvider.METAMASK:
          return await this.connectMetaMask()
        case WalletProvider.WALLETCONNECT:
          return await this.connectWalletConnect()
        case WalletProvider.COINBASE:
          return await this.connectCoinbaseWallet()
        case WalletProvider.INJECTED:
          return await this.connectInjectedWallet()
        default:
          throw new Error(`Unsupported wallet provider: ${provider}`)
      }
    } catch (error) {
      console.error(`Failed to connect ${provider}:`, error)
      return false
    }
  }

  private async connectMetaMask(): Promise<boolean> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask.')
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts && accounts.length > 0) {
        const address = accounts[0]
        const provider = new ethers.BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        const balance = await provider.getBalance(address)

        const account: EthereumAccount = {
          accountId: address, // For compatibility
          publicKey: address,
          balance: ethers.formatEther(balance),
          tokens: []
        }

        this.connectionState = {
          isConnected: true,
          account,
          provider: WalletProvider.METAMASK,
          network: this.mapChainIdToNetwork(Number(network.chainId))
        }

        // Listen for account and network changes
        window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this))
        window.ethereum.on('chainChanged', this.handleChainChanged.bind(this))

        this.notifyListeners()
        return true
      }

      return false
    } catch (error) {
      console.error('MetaMask connection failed:', error)
      return false
    }
  }

  private async connectWalletConnect(): Promise<boolean> {
    try {
      // WalletConnect v2 implementation would go here
      // This requires @walletconnect/ethereum-provider package
      console.log('WalletConnect integration needed')
      return false
    } catch (error) {
      console.error('WalletConnect connection failed:', error)
      return false
    }
  }

  private async connectCoinbaseWallet(): Promise<boolean> {
    try {
      if (window.ethereum && window.ethereum.isCoinbaseWallet) {
        return await this.connectInjectedWallet()
      }
      console.log('Coinbase Wallet not found')
      return false
    } catch (error) {
      console.error('Coinbase Wallet connection failed:', error)
      return false
    }
  }

  private async connectInjectedWallet(): Promise<boolean> {
    try {
      if (!window.ethereum) {
        throw new Error('No injected wallet found')
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts && accounts.length > 0) {
        const address = accounts[0]
        const provider = new ethers.BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        const balance = await provider.getBalance(address)

        const account: EthereumAccount = {
          accountId: address,
          publicKey: address,
          balance: ethers.formatEther(balance),
          tokens: []
        }

        this.connectionState = {
          isConnected: true,
          account,
          provider: WalletProvider.INJECTED,
          network: this.mapChainIdToNetwork(Number(network.chainId))
        }

        this.notifyListeners()
        return true
      }

      return false
    } catch (error) {
      console.error('Injected wallet connection failed:', error)
      return false
    }
  }

  private handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // Disconnect
      await this.disconnect()
    } else if (accounts[0] !== this.connectionState.account?.accountId) {
      // Account changed - reconnect
      if (this.connectionState.provider) {
        await this.connectWallet(this.connectionState.provider)
      }
    }
  }

  private handleChainChanged = (chainId: string) => {
    // Reload the page when chain changes as recommended by MetaMask
    window.location.reload()
  }

  private mapChainIdToNetwork(chainId: number): EthereumNetwork {
    switch (chainId) {
      case 1:
        return EthereumNetwork.MAINNET
      case 5:
        return EthereumNetwork.GOERLI
      case 11155111:
        return EthereumNetwork.SEPOLIA
      case 1337:
      case 31337:
        return EthereumNetwork.LOCALHOST
      default:
        return EthereumNetwork.SEPOLIA
    }
  }

  public async switchNetwork(network: EthereumNetwork): Promise<boolean> {
    if (!window.ethereum) return false

    try {
      const chainId = this.getChainIdForNetwork(network)
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      })

      return true
    } catch (error: any) {
      // Chain not added to wallet
      if (error.code === 4902) {
        return await this.addNetwork(network)
      }
      console.error('Failed to switch network:', error)
      return false
    }
  }

  private async addNetwork(network: EthereumNetwork): Promise<boolean> {
    if (!window.ethereum) return false

    const networkConfig = this.getNetworkConfig(network)
    if (!networkConfig) return false

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig]
      })
      return true
    } catch (error) {
      console.error('Failed to add network:', error)
      return false
    }
  }

  private getChainIdForNetwork(network: EthereumNetwork): number {
    switch (network) {
      case EthereumNetwork.MAINNET:
        return 1
      case EthereumNetwork.GOERLI:
        return 5
      case EthereumNetwork.SEPOLIA:
        return 11155111
      case EthereumNetwork.LOCALHOST:
        return 1337
      default:
        return 11155111
    }
  }

  private getNetworkConfig(network: EthereumNetwork) {
    switch (network) {
      case EthereumNetwork.SEPOLIA:
        return {
          chainId: '0xaa36a7',
          chainName: 'Sepolia Testnet',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://sepolia.infura.io/v3/'],
          blockExplorerUrls: ['https://sepolia.etherscan.io/']
        }
      case EthereumNetwork.GOERLI:
        return {
          chainId: '0x5',
          chainName: 'Goerli Testnet',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://goerli.infura.io/v3/'],
          blockExplorerUrls: ['https://goerli.etherscan.io/']
        }
      default:
        return null
    }
  }

  public async disconnect(): Promise<void> {
    try {
      // Remove event listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', this.handleChainChanged)
      }

      this.connectionState = {
        isConnected: false,
        account: null,
        provider: null,
        network: EthereumNetwork.SEPOLIA
      }

      this.notifyListeners()
    } catch (error) {
      console.error('Disconnect failed:', error)
    }
  }

  public getConnectionState(): WalletConnectionState {
    return { ...this.connectionState }
  }

  public isConnected(): boolean {
    return this.connectionState.isConnected
  }

  public getConnectedAccount(): EthereumAccount | null {
    return this.connectionState.account
  }

  public getProvider(): WalletProvider | null {
    return this.connectionState.provider
  }

  public getNetwork(): EthereumNetwork {
    return this.connectionState.network
  }

  /**
   * Get Web3 provider instance for direct interaction
   */
  public getWeb3Provider(): ethers.BrowserProvider | null {
    if (window.ethereum && this.connectionState.isConnected) {
      return new ethers.BrowserProvider(window.ethereum)
    }
    return null
  }

  /**
   * Sign a message
   */
  public async signMessage(message: string): Promise<string> {
    const provider = this.getWeb3Provider()
    if (!provider) throw new Error('No provider available')

    const signer = await provider.getSigner()
    return await signer.signMessage(message)
  }

  /**
   * Sign typed data (EIP-712)
   */
  public async signTypedData(domain: any, types: any, value: any): Promise<string> {
    const provider = this.getWeb3Provider()
    if (!provider) throw new Error('No provider available')

    const signer = await provider.getSigner()
    return await signer.signTypedData(domain, types, value)
  }
}

// Singleton instance
export const walletService = new WalletService()