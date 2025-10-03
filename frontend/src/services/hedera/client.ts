import { 
  Client, 
  AccountId, 
  PrivateKey,
  Hbar,
  AccountBalanceQuery,
  AccountInfoQuery
} from '@hashgraph/sdk'
import { HederaNetwork, type HederaConfig, type HederaAccount } from '../../types/hedera'

// Load environment variables
const OPERATOR_ID = import.meta.env.VITE_HEDERA_OPERATOR_ID
const OPERATOR_KEY = import.meta.env.VITE_HEDERA_OPERATOR_KEY
const NETWORK = import.meta.env.VITE_HEDERA_NETWORK || 'testnet'
const MIRROR_NODE_URL = import.meta.env.VITE_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com'
const JSON_RPC_URL = import.meta.env.VITE_JSON_RPC_URL || 'https://testnet.rpc.hedera.com'

const defaultConfig = {
  operatorId: OPERATOR_ID,
  operatorKey: OPERATOR_KEY,
  network: NETWORK as HederaNetwork,
  mirrorNodeUrl: MIRROR_NODE_URL,
  jsonRpcUrl: JSON_RPC_URL
}

export class HederaClient {
  private client: Client | null = null
  private config: HederaConfig

  constructor(config?: HederaConfig) {
    this.config = config || defaultConfig
    this.initializeClient()
  }

  private initializeClient(): void {
    try {
      switch (this.config.network) {
        case HederaNetwork.MAINNET:
          this.client = Client.forMainnet()
          break
        case HederaNetwork.TESTNET:
          this.client = Client.forTestnet()
          console.log(this.client)
          break
        case HederaNetwork.PREVIEWNET:
          this.client = Client.forPreviewnet()
          break
        case HederaNetwork.LOCAL:
          this.client = Client.forNetwork({})
          break
        default:
          this.client = Client.forNetwork({})
      }

      if (this.config.operatorId && this.config.operatorKey) {
        this.client.setOperator(
          AccountId.fromString(this.config.operatorId),
          PrivateKey.fromStringECDSA(this.config.operatorKey)
        )
      }
      console.log(`✅ Hedera client initialized for ${this.config.network}`)
    } catch (error) {
      console.error('Failed to initialize Hedera client:', error)
      throw new Error('Hedera client initialization failed')
    }
  }

  public getClient(): Client {
    if (!this.client) throw new Error('Hedera client not initialized')
    return this.client
  }

  public async getAccountInfo(accountId: string): Promise<HederaAccount> {
    if (!this.client) throw new Error('Client not initialized')
    try {
      const accountInfo = await new AccountInfoQuery()
        .setAccountId(AccountId.fromString(accountId))
        .execute(this.client)

      const balance = await new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId))
        .execute(this.client)

      const tokens = balance.tokens
        ? [...balance.tokens].map(([tokenId, amount]) => ({
            tokenId: tokenId.toString(),
            symbol: tokenId.toString(), // TODO: fetch actual token symbol
            balance: amount.toString(),
            decimals: 8 // TODO: fetch actual token decimals
          }))
        : []

      return {
        accountId,
        publicKey: accountInfo.key.toString(),
        balance: balance.hbars.toString(),
        tokens
      }
    } catch (error) {
      console.error('Failed to get account info:', error)
      throw new Error('Failed to retrieve account information')
    }
  }

  public async validateConnection(): Promise<boolean> {
    if (!this.client) return false
    try {
      const networkInfo = this.client.ledgerId
      return Boolean(networkInfo)
    } catch (error) {
      console.error('Connection validation failed:', error)
      return false
    }
  }

  public getNetworkInfo() {
    return {
      network: this.config.network,
      mirrorNodeUrl: this.config.mirrorNodeUrl,
      jsonRpcUrl: this.config.jsonRpcUrl
    }
  }

  public close(): void {
    if (this.client) {
      this.client.close()
      this.client = null
    }
  }
}

// Singleton instance
let clientInstance: HederaClient | null = null

export function initializeHederaClient(config?: HederaConfig): HederaClient {
  if (!clientInstance) {
    clientInstance = new HederaClient(config)
  }
  return clientInstance
}

export function getHederaClient(): HederaClient {
  if (!clientInstance) throw new Error('Hedera client not initialized. Call initializeHederaClient first.')
  return clientInstance
}

export function closeHederaClient(): void {
  if (clientInstance) {
    clientInstance.close()
    clientInstance = null
  }
}
