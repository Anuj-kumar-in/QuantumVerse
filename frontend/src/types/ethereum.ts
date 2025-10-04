
export enum EthereumNetwork {
  MAINNET = 'mainnet',
  SEPOLIA = 'sepolia',
  GOERLI = 'goerli',
  LOCALHOST = 'localhost'
}

export enum WalletProvider {
  METAMASK = 'metamask',
  WALLETCONNECT = 'walletconnect',
  COINBASE = 'coinbase',
  INJECTED = 'injected'
}

export interface EthereumConfig {
  privateKey?: string
  network: EthereumNetwork
  rpcUrl: string
  infuraProjectId?: string
}

export interface EthereumAccount {
  accountId: string // Ethereum address
  publicKey: string // Ethereum address
  balance: string // ETH balance in ether units
  tokens: TokenInfo[]
}

export interface TokenInfo {
  tokenId: string // Contract address
  symbol: string
  balance: string
  decimals: number
}

export interface WalletConnectionState {
  isConnected: boolean
  account: EthereumAccount | null
  provider: WalletProvider | null
  network: EthereumNetwork
}

export interface ConsensusMessage {
  topicId: string
  message: string
  timestamp: Date
  sequenceNumber: number
  runningHash: string
}

export interface SmartContractInfo {
  name: string
  contractId: string // Contract address
  abi: any[]
  bytecode?: string
  deployedAt?: Date
  network: EthereumNetwork
}

// Physics NFT types (unchanged for compatibility)
export enum PhysicsType {
  GRAVITY = 'GRAVITY',
  ELECTROMAGNETISM = 'ELECTROMAGNETISM',
  STRONG_FORCE = 'STRONG_FORCE',
  WEAK_FORCE = 'WEAK_FORCE',
  QUANTUM = 'QUANTUM',
  THERMODYNAMICS = 'THERMODYNAMICS'
}

export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC'
}

export interface PhysicsNFT {
  tokenId: string
  serial: number
  name: string
  physicsType: PhysicsType
  rarity: Rarity
  properties: PhysicsProperties
  metadata: string
  owner: string
}

export interface PhysicsProperties {
  magnitude: number
  duration: number // in seconds
  range: number // in meters
  precision: number // decimal places
  stability: number // 0-100%
}