export interface HederaAccount {
  accountId: string;
  publicKey: string;
  balance: string;
  tokens: TokenBalance[];
}

export interface TokenBalance {
  tokenId: string;
  symbol: string;
  balance: string;
  decimals: number;
}

export interface HederaTransaction {
  transactionId: string;
  timestamp: Date;
  type: TransactionType;
  status: TransactionStatus;
  amount?: string;
  tokenId?: string;
  memo?: string;
  consensusTimestamp?: string;
}

export enum TransactionType {
  TRANSFER = 'TRANSFER',
  TOKEN_MINT = 'TOKEN_MINT',
  TOKEN_BURN = 'TOKEN_BURN',
  TOKEN_ASSOCIATE = 'TOKEN_ASSOCIATE',
  TOKEN_DISSOCIATE = 'TOKEN_DISSOCIATE',
  SMART_CONTRACT_CALL = 'SMART_CONTRACT_CALL',
  CONSENSUS_SUBMIT_MESSAGE = 'CONSENSUS_SUBMIT_MESSAGE'
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  UNKNOWN = 'UNKNOWN'
}

export interface WalletConnectionState {
  isConnected: boolean;
  account: HederaAccount | null;
  provider: WalletProvider | null;
  network: HederaNetwork;
}

export enum WalletProvider {
  HASHPACK = 'HASHPACK',
  BLADE = 'BLADE',
  KABILA = 'KABILA',
  METAMASK = 'METAMASK',
  WALLETCONNECT = 'WALLETCONNECT'
}

export enum HederaNetwork {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  PREVIEWNET = 'previewnet',
  LOCAL = 'local'
}

export interface HederaConfig {
  network: HederaNetwork;
  operatorId?: string;
  operatorKey?: string;
  mirrorNodeUrl: string;
  jsonRpcUrl: string;
}

export interface ConsensusMessage {
  topicId: string;
  message: string;
  timestamp: Date;
  sequenceNumber: number;
  runningHash: string;
}

export interface SmartContractInfo {
  contractId: string;
  contractAddress: string;
  name: string;
  symbol?: string;
  abi: any[];
}