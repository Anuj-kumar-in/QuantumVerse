
import { ethers } from 'ethers'
import { type EthereumConfig, type EthereumAccount, EthereumNetwork } from '../../types/ethereum'

// Load environment variables
const PRIVATE_KEY = import.meta.env.VITE_ETHEREUM_PRIVATE_KEY
const NETWORK = import.meta.env.VITE_ETHEREUM_NETWORK || 'sepolia'
const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID'
const INFURA_PROJECT_ID = import.meta.env.VITE_INFURA_PROJECT_ID

const defaultConfig: EthereumConfig = {
  privateKey: PRIVATE_KEY,
  network: NETWORK as EthereumNetwork,
  rpcUrl: RPC_URL,
  infuraProjectId: INFURA_PROJECT_ID
}

export class HederaClient { // Keep name for frontend compatibility
  private provider: ethers.Provider | null = null
  private signer: ethers.Signer | null = null
  private config: EthereumConfig

  constructor(config?: EthereumConfig) {
    this.config = config || defaultConfig
    this.initializeClient()
  }

  private initializeClient(): void {
    try {
      // Initialize provider based on network
      switch (this.config.network) {
        case EthereumNetwork.MAINNET:
          this.provider = new ethers.InfuraProvider('mainnet', this.config.infuraProjectId)
          break
        case EthereumNetwork.SEPOLIA:
          this.provider = new ethers.InfuraProvider('sepolia', this.config.infuraProjectId)
          break
        case EthereumNetwork.GOERLI:
          this.provider = new ethers.InfuraProvider('goerli', this.config.infuraProjectId)
          break
        case EthereumNetwork.LOCALHOST:
          this.provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')
          break
        default:
          this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl)
      }

      // Create signer if private key is provided
      if (this.config.privateKey && this.provider) {
        this.signer = new ethers.Wallet(this.config.privateKey, this.provider)
      }

      console.log(`✅ Ethereum client initialized for ${this.config.network}`)
    } catch (error) {
      console.error('Failed to initialize Ethereum client:', error)
      throw new Error('Ethereum client initialization failed')
    }
  }

  public getClient(): ethers.Provider {
    if (!this.provider) throw new Error('Ethereum provider not initialized')
    return this.provider
  }

  public getSigner(): ethers.Signer {
    if (!this.signer) throw new Error('Ethereum signer not initialized')
    return this.signer
  }

  public async getAccountInfo(address: string): Promise<EthereumAccount> {
    if (!this.provider) throw new Error('Provider not initialized')
    
    try {
      const balance = await this.provider.getBalance(address)
      const nonce = await this.provider.getTransactionCount(address)

      return {
        accountId: address, // Keep accountId for frontend compatibility
        publicKey: address,
        balance: ethers.formatEther(balance),
        tokens: [] // Would need separate token contract calls
      }
    } catch (error) {
      console.error('Failed to get account info:', error)
      throw new Error('Failed to retrieve account information')
    }
  }

  public async validateConnection(): Promise<boolean> {
    if (!this.provider) return false
    try {
      await this.provider.getNetwork()
      return true
    } catch (error) {
      console.error('Connection validation failed:', error)
      return false
    }
  }

  public getNetworkInfo() {
    return {
      network: this.config.network,
      rpcUrl: this.config.rpcUrl,
      infuraProjectId: this.config.infuraProjectId
    }
  }

  public close(): void {
    // Ethereum providers don't need explicit closing
    this.provider = null
    this.signer = null
  }
}

// Singleton instance
let clientInstance: HederaClient | null = null

export function initializeHederaClient(config?: EthereumConfig): HederaClient {
  if (!clientInstance) {
    clientInstance = new HederaClient(config)
  }
  return clientInstance
}

export function getHederaClient(): HederaClient {
  if (!clientInstance) throw new Error('Ethereum client not initialized. Call initializeHederaClient first.')
  return clientInstance
}

export function closeHederaClient(): void {
  if (clientInstance) {
    clientInstance.close()
    clientInstance = null
  }
}