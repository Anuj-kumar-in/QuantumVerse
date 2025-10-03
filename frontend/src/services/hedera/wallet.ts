import { AccountId, Client } from '@hashgraph/sdk'
import {HWBridgeProvider } from '@buidlerlabs/hashgraph-react-wallets'
import { 
  type WalletConnectionState, 
  WalletProvider, 
  HederaNetwork,
  type HederaAccount 
} from '../../types/hedera'

export class WalletService {
  private connectionState: WalletConnectionState = {
    isConnected: false,
    account: null,
    provider: null,
    network: HederaNetwork.TESTNET
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
    try {
      switch (provider) {
        case WalletProvider.HASHPACK:
          return await this.connectHashPack()
        case WalletProvider.BLADE:
          return await this.connectBlade()
        case WalletProvider.KABILA:
          return await this.connectKabila()
        case WalletProvider.METAMASK:
          return await this.connectMetaMask()
        case WalletProvider.WALLETCONNECT:
          return await this.connectWalletConnect()
        default:
          throw new Error(`Unsupported wallet provider: ${provider}`)
      }
    } catch (error) {
      console.error(`Failed to connect ${provider}:`, error)
      return false
    }
  }

  private async connectHashPack(): Promise<boolean> {
    try {
      // Check if HashPack is available
      if (!(window as any).hashpack) {
        throw new Error('HashPack wallet not found')
      }

      const hashpack = (window as any).hashpack
      const appMetadata = {
        name: import.meta.env.VITE_APP_NAME || 'QuantumVerse',
        description: import.meta.env.VITE_APP_DESCRIPTION || 'Quantum Gaming',
        icon: window.location.origin + '/quantum-logo.svg'
      }

      // Initialize and connect
      await hashpack.init(appMetadata)
      const connectData = await hashpack.connect()

      if (connectData.accountIds && connectData.accountIds.length > 0) {
        const accountId = connectData.accountIds[0]
        const account = await this.getAccountInfo(accountId)

        this.connectionState = {
          isConnected: true,
          account,
          provider: WalletProvider.HASHPACK,
          network: this.getNetworkFromAccountId(accountId)
        }

        this.notifyListeners()
        return true
      }

      return false
    } catch (error) {
      console.error('HashPack connection failed:', error)
      return false
    }
  }

  private async connectBlade(): Promise<boolean> {
    try {
      if (!(window as any).blade) {
        throw new Error('Blade wallet not found')
      }

      const blade = (window as any).blade
      const result = await blade.createAccount()

      if (result.accountId) {
        const account = await this.getAccountInfo(result.accountId)

        this.connectionState = {
          isConnected: true,
          account,
          provider: WalletProvider.BLADE,
          network: this.getNetworkFromAccountId(result.accountId)
        }

        this.notifyListeners()
        return true
      }

      return false
    } catch (error) {
      console.error('Blade connection failed:', error)
      return false
    }
  }

  private async connectKabila(): Promise<boolean> {
    try {
      if (!(window as any).kabila) {
        console.warn('Kabila wallet not available. Please install the Kabila wallet extension.')
        return false
      }

      const kabila = (window as any).kabila
      const result = await kabila.connect()

      if (result.accountId) {
        const account = await this.getAccountInfo(result.accountId)

        this.connectionState = {
          isConnected: true,
          account,
          provider: WalletProvider.KABILA,
          network: this.getNetworkFromAccountId(result.accountId)
        }

        this.notifyListeners()
        return true
      }

      return false
    } catch (error) {
      console.error('Kabila connection failed:', error)
      return false
    }
  }

  private async connectMetaMask(): Promise<boolean> {
    try {
      if (!(window as any).ethereum) {
        throw new Error('MetaMask not found')
      }

      const ethereum = (window as any).ethereum

      // Request account access
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      })

      if (accounts && accounts.length > 0) {
        // For MetaMask, we need to derive the Hedera account ID
        // This is a simplified implementation
        const account: HederaAccount = {
          accountId: 'MetaMask-Connected', // Placeholder
          publicKey: accounts[0],
          balance: '0',
          tokens: []
        }

        this.connectionState = {
          isConnected: true,
          account,
          provider: WalletProvider.METAMASK,
          network: HederaNetwork.TESTNET
        }

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
      // WalletConnect implementation would go here
      // This requires setting up the WalletConnect provider
      console.log('WalletConnect not implemented yet')
      return false
    } catch (error) {
      console.error('WalletConnect connection failed:', error)
      return false
    }
  }

  private async getAccountInfo(accountId: string): Promise<HederaAccount> {
    // This would typically call the HederaClientService
    // For now, return mock data
    return {
      accountId,
      publicKey: 'mock-public-key',
      balance: '1000.00000000',
      tokens: []
    }
  }

  private getNetworkFromAccountId(accountId: string): HederaNetwork {
    // Determine network based on account ID pattern
    if (accountId.startsWith('0.0.')) {
      // Testnet typically has lower account IDs
      const id = parseInt(accountId.split('.')[2])
      return id < 1000000 ? HederaNetwork.TESTNET : HederaNetwork.MAINNET
    }
    return HederaNetwork.TESTNET
  }

  public async disconnect(): Promise<void> {
    try {
      // Call provider-specific disconnect if needed
      if (this.connectionState.provider === WalletProvider.HASHPACK) {
        const hashpack = (window as any).hashpack
        if (hashpack && hashpack.disconnect) {
          await hashpack.disconnect()
        }
      }

      this.connectionState = {
        isConnected: false,
        account: null,
        provider: null,
        network: HederaNetwork.TESTNET
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

  public getConnectedAccount(): HederaAccount | null {
    return this.connectionState.account
  }

  public getProvider(): WalletProvider | null {
    return this.connectionState.provider
  }

  public getNetwork(): HederaNetwork {
    return this.connectionState.network
  }
}

// Singleton instance
export const walletService = new WalletService()