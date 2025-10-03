import {
  Client,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenBurnTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  TokenInfoQuery,
  TokenNftInfoQuery,
  AccountId,
  PrivateKey,
  TokenId,
  TokenType,
  TokenSupplyType,
  Hbar,
  NftId
} from '@hashgraph/sdk'
import { type PhysicsNFT, PhysicsType, Rarity } from '../../types/physics'
import { getHederaClient } from './client'

export class HTSService {
  private client: Client

  constructor() {
    this.client = getHederaClient().getClient()
  }

  /**
   * Create a new fungible token for the QuantumVerse ecosystem
   */
  public async createFungibleToken(
    name: string,
    symbol: string,
    decimals: number,
    initialSupply: number,
    treasuryAccountId: string,
    adminKey: PrivateKey
  ): Promise<string> {
    try {
      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setDecimals(decimals)
        .setInitialSupply(initialSupply)
        .setTreasuryAccountId(AccountId.fromString(treasuryAccountId))
        .setAdminKey(adminKey)
        .setSupplyKey(adminKey)
        .setFreezeDefault(false)

      const tokenCreateSubmit = await tokenCreateTx.execute(this.client)
      const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(this.client)
      const tokenId = tokenCreateReceipt.tokenId!

      console.log(`✅ Created fungible token: ${tokenId}`)
      return tokenId.toString()
    } catch (error) {
      console.error('Failed to create fungible token:', error)
      throw new Error('Token creation failed')
    }
  }

  /**
   * Create a new NFT collection for Physics NFTs
   */
  public async createNFTCollection(
    name: string,
    symbol: string,
    treasuryAccountId: string,
    adminKey: PrivateKey,
    supplyKey: PrivateKey
  ): Promise<string> {
    try {
      const nftCreateTx = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(10000) // Max 10,000 Physics NFTs
        .setTreasuryAccountId(AccountId.fromString(treasuryAccountId))
        .setAdminKey(adminKey)
        .setSupplyKey(supplyKey)
        .setFreezeDefault(false)

      const nftCreateSubmit = await nftCreateTx.execute(this.client)
      const nftCreateReceipt = await nftCreateSubmit.getReceipt(this.client)
      const tokenId = nftCreateReceipt.tokenId!

      console.log(`✅ Created NFT collection: ${tokenId}`)
      return tokenId.toString()
    } catch (error) {
      console.error('Failed to create NFT collection:', error)
      throw new Error('NFT collection creation failed')
    }
  }

  /**
   * Mint a new Physics NFT
   */
  public async mintPhysicsNFT(
    tokenId: string,
    metadata: string[], // IPFS hashes
    supplyKey: PrivateKey
  ): Promise<number[]> {
    try {
      const mintTx = new TokenMintTransaction()
        .setTokenId(TokenId.fromString(tokenId))
        .setMetadata(metadata.map(meta => Buffer.from(meta)))
        .freezeWith(this.client)

      const mintTxSigned = await mintTx.sign(supplyKey)
      const mintTxSubmit = await mintTxSigned.execute(this.client)
      const mintTxReceipt = await mintTxSubmit.getReceipt(this.client)

      const serials = mintTxReceipt.serials.map(serial => serial.toNumber())
      console.log(`✅ Minted Physics NFTs with serials: ${serials.join(', ')}`)
      return serials
    } catch (error) {
      console.error('Failed to mint NFT:', error)
      throw new Error('NFT minting failed')
    }
  }

  /**
   * Associate a token with an account
   */
  public async associateToken(
    accountId: string,
    tokenId: string,
    accountKey: PrivateKey
  ): Promise<boolean> {
    try {
      const associateTx = new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(accountId))
        .setTokenIds([TokenId.fromString(tokenId)])
        .freezeWith(this.client)

      const associateTxSigned = await associateTx.sign(accountKey)
      const associateTxSubmit = await associateTxSigned.execute(this.client)
      const associateTxReceipt = await associateTxSubmit.getReceipt(this.client)

      console.log(`✅ Associated token ${tokenId} with account ${accountId}`)
      return associateTxReceipt.status.toString() === 'SUCCESS'
    } catch (error) {
      console.error('Failed to associate token:', error)
      return false
    }
  }

  /**
   * Transfer tokens between accounts
   */
  public async transferTokens(
    tokenId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    fromKey: PrivateKey
  ): Promise<boolean> {
    try {
      const transferTx = new TransferTransaction()
        .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(fromAccountId), -amount)
        .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(toAccountId), amount)
        .freezeWith(this.client)

      const transferTxSigned = await transferTx.sign(fromKey)
      const transferTxSubmit = await transferTxSigned.execute(this.client)
      const transferTxReceipt = await transferTxSubmit.getReceipt(this.client)

      console.log(`✅ Transferred ${amount} tokens from ${fromAccountId} to ${toAccountId}`)
      return transferTxReceipt.status.toString() === 'SUCCESS'
    } catch (error) {
      console.error('Failed to transfer tokens:', error)
      return false
    }
  }

  /**
   * Transfer NFT between accounts
   */
  public async transferNFT(
    tokenId: string,
    serial: number,
    fromAccountId: string,
    toAccountId: string,
    fromKey: PrivateKey
  ): Promise<boolean> {
    try {
      const transferTx = new TransferTransaction()
        .addNftTransfer(
          NftId.fromString(`${tokenId}/${serial}`),
          AccountId.fromString(fromAccountId),
          AccountId.fromString(toAccountId)
        )
        .freezeWith(this.client)

      const transferTxSigned = await transferTx.sign(fromKey)
      const transferTxSubmit = await transferTxSigned.execute(this.client)
      const transferTxReceipt = await transferTxSubmit.getReceipt(this.client)

      console.log(`✅ Transferred NFT ${tokenId}/${serial} from ${fromAccountId} to ${toAccountId}`)
      return transferTxReceipt.status.toString() === 'SUCCESS'
    } catch (error) {
      console.error('Failed to transfer NFT:', error)
      return false
    }
  }

  /**
   * Get token information
   */
  public async getTokenInfo(tokenId: string) {
    try {
      const tokenInfo = await new TokenInfoQuery()
        .setTokenId(TokenId.fromString(tokenId))
        .execute(this.client)

      return {
        tokenId: tokenInfo.tokenId.toString(),
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        totalSupply: tokenInfo.totalSupply.toString(),
        treasury: tokenInfo.treasuryAccountId?.toString() || null,
        adminKey: tokenInfo.adminKey?.toString(),
        supplyKey: tokenInfo.supplyKey?.toString()
      }
    } catch (error) {
      console.error('Failed to get token info:', error)
      throw new Error('Failed to retrieve token information')
    }
  }

  /**
   * Get NFT information
   */
  public async getNFTInfo(tokenId: string, serial: number) {
    try {
      const nftInfos = await new TokenNftInfoQuery()
        .setNftId(NftId.fromString(`${tokenId}/${serial}`))
        .execute(this.client)

      const nftInfo = nftInfos[0]
      return {
        tokenId: nftInfo.nftId.tokenId.toString(),
        serial: nftInfo.nftId.serial.toNumber(),
        accountId: nftInfo.accountId.toString(),
        creationTime: nftInfo.creationTime,
        metadata: nftInfo.metadata ? Buffer.from(nftInfo.metadata).toString() : null
      }
    } catch (error) {
      console.error('Failed to get NFT info:', error)
      throw new Error('Failed to retrieve NFT information')
    }
  }

  /**
   * Generate sample Physics NFT metadata
   */
  public generatePhysicsNFTMetadata(
    name: string,
    physicsType: PhysicsType,
    rarity: Rarity,
    properties: any
  ): string {
    const metadata = {
      name,
      description: `A ${rarity} ${physicsType} NFT that controls physical laws in QuantumVerse`,
      image: `https://quantumverse.hedera.com/nft/${physicsType.toLowerCase()}.png`,
      attributes: [
        {
          trait_type: "Physics Type",
          value: physicsType
        },
        {
          trait_type: "Rarity",
          value: rarity
        },
        {
          trait_type: "Magnitude",
          value: properties.magnitude || 1.0
        },
        {
          trait_type: "Duration",
          value: properties.duration || 60
        },
        {
          trait_type: "Range",
          value: properties.range || 10
        }
      ],
      properties: {
        category: "Physics NFT",
        creator: "QuantumVerse",
        ecosystem: "Hedera Hashgraph"
      }
    }

    return JSON.stringify(metadata)
  }
}

// Singleton instance
let htsInstance: HTSService | null = null

export function getHTSService(): HTSService {
  if (!htsInstance) {
    htsInstance = new HTSService()
  }
  return htsInstance
}