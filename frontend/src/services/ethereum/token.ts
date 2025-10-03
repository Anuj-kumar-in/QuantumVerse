
import { ethers } from 'ethers'
import { getHederaClient } from './client'
import { type PhysicsNFT, PhysicsType, Rarity } from '../../types/physics'

// Standard ERC20 ABI
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
]

// Standard ERC721 ABI
const ERC721_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function mint(address to, string memory uri) returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
]

export class HTSService { // Keep name for frontend compatibility
  private provider: ethers.Provider
  private signer: ethers.Signer

  constructor() {
    const client = getHederaClient()
    this.provider = client.getClient()
    this.signer = client.getSigner()
  }

  /**
   * Deploy a new ERC20 token for the QuantumVerse ecosystem
   */
  public async createFungibleToken(
    name: string,
    symbol: string,
    decimals: number,
    initialSupply: number,
    treasuryAddress: string
  ): Promise<string> {
    try {
      // ERC20 contract bytecode would be deployed here
      // For simplicity, assuming we have a factory contract
      const factoryAddress = import.meta.env.VITE_TOKEN_FACTORY_ADDRESS
      const factoryABI = [
        "function createERC20(string name, string symbol, uint8 decimals, uint256 initialSupply, address treasury) returns (address)"
      ]
      
      const factory = new ethers.Contract(factoryAddress, factoryABI, this.signer)
      const tx = await factory.createERC20(name, symbol, decimals, ethers.parseUnits(initialSupply.toString(), decimals), treasuryAddress)
      const receipt = await tx.wait()
      
      // Extract token address from event logs
      const tokenAddress = receipt.logs[0].address // Simplified extraction
      
      console.log(`✅ Created ERC20 token: ${tokenAddress}`)
      return tokenAddress
    } catch (error) {
      console.error('Failed to create ERC20 token:', error)
      throw new Error('Token creation failed')
    }
  }

  /**
   * Deploy a new ERC721 collection for Physics NFTs
   */
  public async createNFTCollection(
    name: string,
    symbol: string,
    treasuryAddress: string
  ): Promise<string> {
    try {
      const factoryAddress = import.meta.env.VITE_NFT_FACTORY_ADDRESS
      const factoryABI = [
        "function createERC721(string name, string symbol, address treasury) returns (address)"
      ]
      
      const factory = new ethers.Contract(factoryAddress, factoryABI, this.signer)
      const tx = await factory.createERC721(name, symbol, treasuryAddress)
      const receipt = await tx.wait()
      
      const tokenAddress = receipt.logs[0].address
      
      console.log(`✅ Created ERC721 collection: ${tokenAddress}`)
      return tokenAddress
    } catch (error) {
      console.error('Failed to create ERC721 collection:', error)
      throw new Error('NFT collection creation failed')
    }
  }

  /**
   * Mint a new Physics NFT
   */
  public async mintPhysicsNFT(
    tokenAddress: string,
    to: string,
    metadata: string[] // IPFS URIs
  ): Promise<number[]> {
    try {
      const nftContract = new ethers.Contract(tokenAddress, ERC721_ABI, this.signer)
      const tokenIds: number[] = []
      
      for (const uri of metadata) {
        const tx = await nftContract.mint(to, uri)
        const receipt = await tx.wait()
        
        // Extract token ID from Transfer event
        const transferEvent = receipt.logs.find((log: any) => 
          log.fragment?.name === 'Transfer'
        )
        const tokenId = transferEvent?.args?.[2]?.toString()
        tokenIds.push(parseInt(tokenId))
      }
      
      console.log(`✅ Minted Physics NFTs with IDs: ${tokenIds.join(', ')}`)
      return tokenIds
    } catch (error) {
      console.error('Failed to mint NFT:', error)
      throw new Error('NFT minting failed')
    }
  }

  /**
   * Transfer ERC20 tokens between accounts
   */
  public async transferTokens(
    tokenAddress: string,
    fromAddress: string,
    toAddress: string,
    amount: number
  ): Promise<boolean> {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer)
      const decimals = await tokenContract.decimals()
      const tx = await tokenContract.transfer(toAddress, ethers.parseUnits(amount.toString(), decimals))
      const receipt = await tx.wait()
      
      console.log(`✅ Transferred ${amount} tokens from ${fromAddress} to ${toAddress}`)
      return receipt.status === 1
    } catch (error) {
      console.error('Failed to transfer tokens:', error)
      return false
    }
  }

  /**
   * Transfer NFT between accounts
   */
  public async transferNFT(
    tokenAddress: string,
    tokenId: number,
    fromAddress: string,
    toAddress: string
  ): Promise<boolean> {
    try {
      const nftContract = new ethers.Contract(tokenAddress, ERC721_ABI, this.signer)
      const tx = await nftContract.transferFrom(fromAddress, toAddress, tokenId)
      const receipt = await tx.wait()
      
      console.log(`✅ Transferred NFT ${tokenAddress}/${tokenId} from ${fromAddress} to ${toAddress}`)
      return receipt.status === 1
    } catch (error) {
      console.error('Failed to transfer NFT:', error)
      return false
    }
  }

  /**
   * Get ERC20 token information
   */
  public async getTokenInfo(tokenAddress: string) {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider)
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ])
      
      return {
        tokenId: tokenAddress, // For compatibility
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        treasury: null, // Not available in standard ERC20
        adminKey: null,
        supplyKey: null
      }
    } catch (error) {
      console.error('Failed to get token info:', error)
      throw new Error('Failed to retrieve token information')
    }
  }

  /**
   * Get NFT information
   */
  public async getNFTInfo(tokenAddress: string, tokenId: number) {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC721_ABI, this.provider)
      
      const [owner, tokenURI] = await Promise.all([
        contract.ownerOf(tokenId),
        contract.tokenURI(tokenId)
      ])
      
      return {
        tokenId: tokenAddress,
        serial: tokenId,
        accountId: owner, // For compatibility
        creationTime: null, // Not available in standard ERC721
        metadata: tokenURI
      }
    } catch (error) {
      console.error('Failed to get NFT info:', error)
      throw new Error('Failed to retrieve NFT information')
    }
  }

  /**
   * Generate sample Physics NFT metadata (unchanged)
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
      image: `https://quantumverse.ethereum.com/nft/${physicsType.toLowerCase()}.png`,
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
        ecosystem: "Ethereum"
      }
    }

    return JSON.stringify(metadata)
  }

  /**
   * Get token balance for an address
   */
  public async getTokenBalance(tokenAddress: string, address: string): Promise<string> {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider)
      const balance = await contract.balanceOf(address)
      const decimals = await contract.decimals()
      return ethers.formatUnits(balance, decimals)
    } catch (error) {
      console.error('Failed to get token balance:', error)
      return '0'
    }
  }

  /**
   * Approve token spending
   */
  public async approveToken(tokenAddress: string, spender: string, amount: string): Promise<boolean> {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer)
      const decimals = await contract.decimals()
      const tx = await contract.approve(spender, ethers.parseUnits(amount, decimals))
      const receipt = await tx.wait()
      return receipt.status === 1
    } catch (error) {
      console.error('Failed to approve token:', error)
      return false
    }
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
