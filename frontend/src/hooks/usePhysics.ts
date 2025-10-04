import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { blockchainService } from '../services/ethereum/blockchain'
import { walletService } from '../services/ethereum/wallet'

export enum PhysicsType {
  GRAVITY = 0,
  TIME = 1,
  WEATHER = 2,
  MATTER = 3,
  ENERGY = 4,
  SPACE = 5,
  QUANTUM_FIELD = 6
}

export enum Rarity {
  COMMON = 0,
  UNCOMMON = 1,
  RARE = 2,
  EPIC = 3,
  LEGENDARY = 4,
  MYTHIC = 5
}

export interface PhysicsProperties {
  magnitude: number
  duration: number
  range: number
  cooldown: number
  energyCost: number
  compatibility: string[]
}

export interface PhysicsNFT {
  id: number
  owner: string
  physicsType: PhysicsType
  rarity: Rarity
  energy: number
  isActive: boolean
  tokenURI?: string
  name: string
  description: string
  price?: string
  creator: string
  createdAt: number
  metadata: string
  properties: PhysicsProperties
}

export interface PhysicsProposal {
  id: number
  description: string
  forVotes: number
  againstVotes: number
  executed: boolean
  proposer: string
  timestamp: number
}

export interface PhysicsState {
  isLoading: boolean
  error: string | null
  nfts: PhysicsNFT[]
  userNFTs: PhysicsNFT[]
  proposals: PhysicsProposal[]
  tokenBalance: string
  isMinting: boolean
  isVoting: boolean
}

export const usePhysics = () => {
  const [state, setState] = useState<PhysicsState>({
    isLoading: false,
    error: null,
    nfts: [],
    userNFTs: [],
    proposals: [],
    tokenBalance: '0',
    isMinting: false,
    isVoting: false
  })

  // Check if current address is authorized to mint
  const checkAuthorization = useCallback(async (): Promise<{isAuthorized: boolean, isOwner: boolean, address: string}> => {
    if (!blockchainService.isConnected()) {
      return { isAuthorized: false, isOwner: false, address: '' }
    }

    try {
      const accountId = blockchainService.getAccount()
      const physicsNFTContract = await blockchainService.getContract('PhysicsNFTCollection')

      if (!accountId || !physicsNFTContract) {
        return { isAuthorized: false, isOwner: false, address: '' }
      }

      const evmAddress = blockchainService.accountIdToAddress(accountId)
      
      // Check authorization status
      const isAuthorized = await physicsNFTContract.authorizedMinters(evmAddress)
      const owner = await physicsNFTContract.owner()
      const isOwner = owner.toLowerCase() === evmAddress.toLowerCase()
      
      console.log('=== AUTHORIZATION CHECK ===')
      console.log('Current address:', evmAddress)
      console.log('Contract owner:', owner)
      console.log('Is owner:', isOwner)
      console.log('Is authorized minter:', isAuthorized)
      
      return { isAuthorized, isOwner, address: evmAddress }

    } catch (error) {
      console.error('Failed to check authorization:', error)
      return { isAuthorized: false, isOwner: false, address: '' }
    }
  }, [])

  // Authorize the current connected address (must be called by contract owner)
  const authorizeMinter = useCallback(async (): Promise<boolean> => {
    if (!blockchainService.isConnected()) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const accountId = blockchainService.getAccount()
      const physicsNFTContract = await blockchainService.getContract('PhysicsNFTCollection')

      if (!accountId || !physicsNFTContract) {
        throw new Error('Failed to connect to contract')
      }

      const evmAddress = blockchainService.accountIdToAddress(accountId)
      
      // Check if already authorized
      const isAuthorized = await physicsNFTContract.authorizedMinters(evmAddress)
      if (isAuthorized) {
        console.log('✅ Address already authorized!')
        setState(prev => ({ ...prev, isLoading: false }))
        return true
      }

      // Check if current user is owner
      const owner = await physicsNFTContract.owner()
      if (owner.toLowerCase() !== evmAddress.toLowerCase()) {
        throw new Error('Only contract owner can authorize minters. Please connect with the owner wallet.')
      }

      console.log('🔑 Authorizing address:', evmAddress)
      
      // Call addAuthorizedMinter
      const tx = await physicsNFTContract.addAuthorizedMinter(evmAddress)
      console.log('📤 Authorization transaction sent:', tx.hash)

      // Wait for confirmation
      const receipt = await tx.wait()
      console.log('✅ Address authorized successfully! Gas used:', receipt.gasUsed.toString())

      setState(prev => ({ ...prev, isLoading: false, error: null }))
      return true

    } catch (error) {
      console.error('❌ Failed to authorize minter:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: `Authorization failed: ${(error as Error).message}` 
      }))
      return false
    }
  }, [])

  // Authorize any specific address (must be called by contract owner)
  const authorizeAddress = useCallback(async (addressToAuthorize: string): Promise<boolean> => {
    if (!blockchainService.isConnected()) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const accountId = blockchainService.getAccount()
      const physicsNFTContract = await blockchainService.getContract('PhysicsNFTCollection')

      if (!accountId || !physicsNFTContract) {
        throw new Error('Failed to connect to contract')
      }

      const currentAddress = blockchainService.accountIdToAddress(accountId)
      
      // Validate the address to authorize
      if (!ethers.isAddress(addressToAuthorize)) {
        throw new Error('Invalid address format')
      }

      // Check if already authorized
      const isAuthorized = await physicsNFTContract.authorizedMinters(addressToAuthorize)
      if (isAuthorized) {
        console.log('✅ Address already authorized!')
        setState(prev => ({ ...prev, isLoading: false }))
        return true
      }

      // Check if current user is owner
      const owner = await physicsNFTContract.owner()
      if (owner.toLowerCase() !== currentAddress.toLowerCase()) {
        throw new Error('Only contract owner can authorize minters')
      }

      console.log('🔑 Authorizing address:', addressToAuthorize)
      
      // Call addAuthorizedMinter
      const tx = await physicsNFTContract.addAuthorizedMinter(addressToAuthorize)
      console.log('📤 Authorization transaction sent:', tx.hash)

      // Wait for confirmation
      const receipt = await tx.wait()
      console.log('✅ Address authorized successfully! Gas used:', receipt.gasUsed.toString())

      setState(prev => ({ ...prev, isLoading: false, error: null }))
      return true

    } catch (error) {
      console.error('❌ Failed to authorize address:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: `Authorization failed: ${(error as Error).message}` 
      }))
      return false
    }
  }, [])

  // Remove authorization from an address (must be called by contract owner)
  const removeAuthorization = useCallback(async (addressToRemove: string): Promise<boolean> => {
    if (!blockchainService.isConnected()) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const accountId = blockchainService.getAccount()
      const physicsNFTContract = await blockchainService.getContract('PhysicsNFTCollection')

      if (!accountId || !physicsNFTContract) {
        throw new Error('Failed to connect to contract')
      }

      const currentAddress = blockchainService.accountIdToAddress(accountId)
      
      // Check if current user is owner
      const owner = await physicsNFTContract.owner()
      if (owner.toLowerCase() !== currentAddress.toLowerCase()) {
        throw new Error('Only contract owner can remove authorization')
      }

      console.log('🚫 Removing authorization for address:', addressToRemove)
      
      // Call removeAuthorizedMinter
      const tx = await physicsNFTContract.removeAuthorizedMinter(addressToRemove)
      console.log('📤 Remove authorization transaction sent:', tx.hash)

      // Wait for confirmation
      const receipt = await tx.wait()
      console.log('✅ Authorization removed successfully! Gas used:', receipt.gasUsed.toString())

      setState(prev => ({ ...prev, isLoading: false, error: null }))
      return true

    } catch (error) {
      console.error('❌ Failed to remove authorization:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: `Remove authorization failed: ${(error as Error).message}` 
      }))
      return false
    }
  }, [])

  // Load physics data from blockchain
  const loadPhysicsData = useCallback(async () => {
    if (!blockchainService.isConnected()) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const account = blockchainService.getAccount()
      if (!account) throw new Error('No account connected')

      // Get contracts
      const physicsTokenContract = await blockchainService.getContract('PhysicsToken')
      const physicsNFTContract = await blockchainService.getContract('PhysicsNFTCollection')

      if (!physicsTokenContract || !physicsNFTContract) {
        throw new Error('Failed to connect to contracts')
      }

      const evmAddress = blockchainService.accountIdToAddress(account)
      
      // Check authorization status
      const isAuthorized = await physicsNFTContract.authorizedMinters(evmAddress)
      const owner = await physicsNFTContract.owner()
      const isOwner = owner.toLowerCase() === evmAddress.toLowerCase()
      
      console.log('=== AUTHORIZATION STATUS ===')
      console.log('Current address:', evmAddress)
      console.log('Contract owner:', owner)
      console.log('Is owner:', isOwner)
      console.log('Is authorized minter:', isAuthorized)

      let formattedBalance = '0'
      
      // Load Physics token balance
      try {
        const balance = await physicsTokenContract.balanceOf(evmAddress)
        formattedBalance = ethers.formatUnits(balance, 8)
      } catch (error) {
        console.warn('Failed to load physics token balance:', error)
      }

      // Load user's NFTs using standard ERC721 approach
      let userNFTs: PhysicsNFT[] = []
      try {
        const userNFTBalance = await physicsNFTContract.balanceOf(evmAddress)
        console.log('User NFT balance:', userNFTBalance.toString())

        // Check for owned tokens by iterating through possible token IDs
        for (let tokenId = 1; tokenId <= 100; tokenId++) {
          try {
            const tokenOwner = await physicsNFTContract.ownerOf(tokenId)
            
            if (tokenOwner.toLowerCase() === evmAddress.toLowerCase()) {
              const nftData = await physicsNFTContract.getPhysicsNFT(tokenId)
              
              userNFTs.push({
                id: tokenId,
                owner: evmAddress,
                physicsType: nftData.physicsType,
                rarity: nftData.rarity,
                energy: Number(nftData.properties.energyCost),
                isActive: nftData.isActive,
                tokenURI: nftData.metadata,
                name: nftData.name,
                description: nftData.description,
                price: ethers.formatEther(nftData.price || 0),
                creator: nftData.creator,
                createdAt: Number(nftData.createdAt),
                metadata: nftData.metadata,
                properties: {
                  magnitude: Number(nftData.properties.magnitude),
                  duration: Number(nftData.properties.duration),
                  range: Number(nftData.properties.range),
                  cooldown: Number(nftData.properties.cooldown),
                  energyCost: Number(nftData.properties.energyCost),
                  compatibility: Array.isArray(nftData.properties.compatibility) 
                    ? nftData.properties.compatibility 
                    : nftData.properties.compatibility 
                      ? [nftData.properties.compatibility] 
                      : []
                }
              })
            }
          } catch (error) {
            if (error.message?.includes('NonexistentToken')) {
              break
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load user NFTs:', error)
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        userNFTs,
        nfts: userNFTs,
        proposals: [],
        tokenBalance: formattedBalance
      }))

    } catch (error) {
      console.error('Failed to load physics data:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message
      }))
    }
  }, [])

  // CRITICAL FIX: Mint function with correct parameter structure
  const mintNFT = useCallback(async (
    physicsType: PhysicsType, 
    rarity: Rarity,
    customProperties?: Partial<PhysicsProperties>
  ): Promise<boolean> => {
    if (!blockchainService.isConnected()) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
      return false
    }

    setState(prev => ({ ...prev, isMinting: true, error: null }))

    try {
      const accountId = blockchainService.getAccount()
      const physicsNFTContract = await blockchainService.getContract('PhysicsNFTCollection')

      if (!accountId || !physicsNFTContract) {
        throw new Error('Failed to connect to contract')
      }

      const evmAddress = blockchainService.accountIdToAddress(accountId)

      // Get minting fee
      const mintingFee = await physicsNFTContract.mintingFee()

      // Filter out same physics type from compatibility
      const compatibility = customProperties?.compatibility || []
      const currentPhysicsTypeName = PhysicsType[physicsType]
      const validCompatibility = compatibility.filter(comp => comp !== currentPhysicsTypeName)
      
      console.log('=== MINTING DEBUG INFO ===')
      console.log('Physics Type:', physicsType, PhysicsType[physicsType])
      console.log('Rarity:', rarity, Rarity[rarity])
      console.log('Compatibility:', validCompatibility)
      console.log('Minting Fee:', ethers.formatEther(mintingFee))

      // CRITICAL: Based on ABI, pass properties as array in exact order
      const propertiesArray = [
        BigInt(Math.floor((customProperties?.magnitude || 1.0) * 100)), // magnitude (uint256)
        BigInt(customProperties?.duration || 60),                       // duration (uint256)
        BigInt(customProperties?.range || 10),                          // range (uint256)
        BigInt(customProperties?.cooldown || 30),                       // cooldown (uint256)
        BigInt(customProperties?.energyCost || 10),                     // energyCost (uint256)
        validCompatibility // compatibility (string[])
      ]

      console.log('Properties Array:', propertiesArray)

      // Try calling the contract with exact parameter structure
      const tx = await physicsNFTContract.mintPhysicsNFT(
        evmAddress,                                          // to (address)
        `${PhysicsType[physicsType]} ${Rarity[rarity]}`,    // name (string)
        `A ${Rarity[rarity].toLowerCase()} ${PhysicsType[physicsType].toLowerCase()} manipulation NFT`, // description (string)
        physicsType,                                         // physicsType (uint8)
        rarity,                                              // rarity (uint8)
        propertiesArray,                                     // properties as array
        '',                                                  // metadata (string)
        {
          value: mintingFee                                  // payable amount
        }
      )

      console.log('✅ Transaction sent:', tx.hash)
      
      const receipt = await tx.wait()
      console.log('✅ Transaction confirmed! Gas used:', receipt.gasUsed.toString())

      await loadPhysicsData()
      setState(prev => ({ ...prev, isMinting: false }))
      return true

    } catch (error) {
      console.error('❌ Mint failed:', error)
      
      setState(prev => ({
        ...prev,
        isMinting: false,
        error: `Minting failed: ${(error as Error).message}`
      }))
      return false
    }
  }, [loadPhysicsData])

  // Create governance proposal
  const createProposal = useCallback(async (description: string): Promise<boolean> => {
    if (!blockchainService.isConnected()) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
      return false
    }

    try {
      const physicsTokenContract = await blockchainService.getContract('PhysicsToken')
      if (!physicsTokenContract) throw new Error('Failed to connect to contract')

      const tx = await physicsTokenContract.createProposal(description)
      await blockchainService.waitForTransaction(tx.hash)
      await loadPhysicsData()
      return true

    } catch (error) {
      console.error('Failed to create proposal:', error)
      setState(prev => ({ ...prev, error: (error as Error).message }))
      return false
    }
  }, [loadPhysicsData])

  // Vote on proposal
  const voteOnProposal = useCallback(async (proposalId: number, support: boolean): Promise<boolean> => {
    if (!blockchainService.isConnected()) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
      return false
    }

    setState(prev => ({ ...prev, isVoting: true, error: null }))

    try {
      const physicsTokenContract = await blockchainService.getContract('PhysicsToken')
      if (!physicsTokenContract) throw new Error('Failed to connect to contract')

      const tx = await physicsTokenContract.vote(proposalId, support)
      await blockchainService.waitForTransaction(tx.hash)
      await loadPhysicsData()

      setState(prev => ({ ...prev, isVoting: false }))
      return true

    } catch (error) {
      console.error('Failed to vote:', error)
      setState(prev => ({
        ...prev,
        isVoting: false,
        error: (error as Error).message
      }))
      return false
    }
  }, [loadPhysicsData])

  // Activate physics NFT
  const activatePhysics = useCallback(async (tokenId: number): Promise<boolean> => {
    if (!blockchainService.isConnected()) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
      return false
    }

    try {
      const physicsNFTContract = await blockchainService.getContract('PhysicsNFTCollection')
      if (!physicsNFTContract) throw new Error('Failed to connect to contract')

      const tx = await physicsNFTContract.activatePhysics(tokenId)
      await blockchainService.waitForTransaction(tx.hash)
      await loadPhysicsData()
      return true

    } catch (error) {
      console.error('Failed to activate physics:', error)
      setState(prev => ({ ...prev, error: (error as Error).message }))
      return false
    }
  }, [loadPhysicsData])

  // Deactivate physics NFT
  const deactivatePhysics = useCallback(async (tokenId: number): Promise<boolean> => {
    if (!blockchainService.isConnected()) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
      return false
    }

    try {
      const physicsNFTContract = await blockchainService.getContract('PhysicsNFTCollection')
      if (!physicsNFTContract) throw new Error('Failed to connect to contract')

      const tx = await physicsNFTContract.deactivatePhysics(tokenId)
      await blockchainService.waitForTransaction(tx.hash)
      await loadPhysicsData()
      return true

    } catch (error) {
      console.error('Failed to deactivate physics:', error)
      setState(prev => ({ ...prev, error: (error as Error).message }))
      return false
    }
  }, [loadPhysicsData])

  // Load marketplace data
  const loadMarketplace = useCallback(async () => {
    await loadPhysicsData()
  }, [loadPhysicsData])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Load data when wallet connects
  useEffect(() => {
    const connectedAccount = walletService.getConnectedAccount()
    if (connectedAccount) {
      loadPhysicsData()
    }
  }, [loadPhysicsData])

  return {
    state,
    mintNFT,
    checkAuthorization,
    authorizeMinter,
    authorizeAddress,
    removeAuthorization,
    createProposal,
    voteOnProposal,
    activatePhysics,
    deactivatePhysics,
    loadPhysicsData,
    loadMarketplace,
    clearError
  }
}

export default usePhysics
