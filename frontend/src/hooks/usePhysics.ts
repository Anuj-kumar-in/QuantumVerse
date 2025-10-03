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

  // Load physics data from blockchain
  const loadPhysicsData = useCallback(async () => {
    if (!blockchainService.isConnected()) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const account = blockchainService.getAccount()
      if (!account) throw new Error('No account connected')

      // Get contracts
      const physicsTokenContract = blockchainService.getContract('PhysicsToken')
      const physicsNFTContract = blockchainService.getContract('PhysicsNFTCollection')

      if (!physicsTokenContract || !physicsNFTContract) {
        throw new Error('Failed to connect to contracts')
      }

      // Load Physics token balance
      const evmAddress = blockchainService.accountIdToAddress(account)
      let formattedBalance = '0'
      try {
        const balance = await physicsTokenContract.balanceOf(evmAddress)
        formattedBalance = ethers.formatUnits(balance, 8)
      } catch (error) {
        console.warn('Failed to load physics token balance:', error)
        // Keep default '0'
      }

      // Load user's NFTs
      let userNFTBalance = 0n
      try {
        userNFTBalance = await physicsNFTContract.balanceOf(evmAddress)
      } catch (error) {
        console.warn('Failed to load NFT balance:', error)
        // Keep default 0
      }
      const userNFTs: PhysicsNFT[] = []

      // Get user's NFT token IDs (this is simplified - in practice you'd use events or indexing)
      for (let i = 0; i < Math.min(Number(userNFTBalance), 20); i++) {
        try {
          // In practice, you'd get actual token IDs owned by user
          const tokenId = i + 1 // Simplified
          const owner = await physicsNFTContract.ownerOf(tokenId)

          if (owner.toLowerCase() === evmAddress.toLowerCase()) {
            const nftDetails = await physicsNFTContract.getNFTDetails(tokenId)
            const tokenURI = await physicsNFTContract.tokenURI(tokenId)

            userNFTs.push({
              id: tokenId,
              owner: evmAddress,
              physicsType: nftDetails.physicsType,
              rarity: nftDetails.rarity,
              energy: nftDetails.energy.toNumber(),
              isActive: nftDetails.isActive,
              tokenURI,
              name: `${PhysicsType[nftDetails.physicsType]} ${Rarity[nftDetails.rarity]}`,
              description: `A ${Rarity[nftDetails.rarity].toLowerCase()} ${PhysicsType[nftDetails.physicsType].toLowerCase()} manipulation NFT`
            })
          }
        } catch (error) {
          // Token doesn't exist or other error
          break
        }
      }

      // Load recent proposals (simplified - in practice use events)
      const proposals: PhysicsProposal[] = []
      for (let i = 1; i <= 5; i++) {
        try {
          const proposal = await physicsTokenContract.getProposal(i)
          proposals.push({
            id: i,
            description: proposal.description,
            forVotes: proposal.forVotes.toNumber(),
            againstVotes: proposal.againstVotes.toNumber(),
            executed: proposal.executed,
            proposer: account, // In practice, get from events
            timestamp: Date.now() - (i * 24 * 60 * 60 * 1000) // Mock timestamp
          })
        } catch (error) {
          // Proposal doesn't exist
          break
        }
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        userNFTs,
        nfts: userNFTs, // For marketplace, you'd load all NFTs
        proposals,
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

  // Mint new Physics NFT
  const mintNFT = useCallback(async (physicsType: PhysicsType, rarity: Rarity): Promise<boolean> => {
    if (!blockchainService.isConnected()) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
      return false
    }

    setState(prev => ({ ...prev, isMinting: true, error: null }))

    try {
      const accountId = blockchainService.getAccount()
      const physicsNFTContract = blockchainService.getContract('PhysicsNFTCollection')

      if (!accountId || !physicsNFTContract) {
        throw new Error('Failed to connect to contract')
      }

      const evmAddress = blockchainService.accountIdToAddress(accountId)

      // Mint NFT on blockchain
      const tx = await physicsNFTContract.mintPhysicsNFT(evmAddress, physicsType, rarity)
      console.log('NFT minting sent:', tx.hash)

      await blockchainService.waitForTransaction(tx.hash)
      console.log('NFT minted successfully!')

      // Reload data to show new NFT
      await loadPhysicsData()

      setState(prev => ({ ...prev, isMinting: false }))
      return true

    } catch (error) {
      console.error('Failed to mint NFT:', error)
      setState(prev => ({
        ...prev,
        isMinting: false,
        error: (error as Error).message
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
      const physicsTokenContract = blockchainService.getContract('PhysicsToken')
      if (!physicsTokenContract) throw new Error('Failed to connect to contract')

      const tx = await physicsTokenContract.proposePhysicsChange(description)
      console.log('Proposal creation sent:', tx.hash)

      await blockchainService.waitForTransaction(tx.hash)
      console.log('Proposal created!')

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
      const physicsTokenContract = blockchainService.getContract('PhysicsToken')
      if (!physicsTokenContract) throw new Error('Failed to connect to contract')

      const tx = await physicsTokenContract.voteOnProposal(proposalId, support)
      console.log('Vote sent:', tx.hash)

      await blockchainService.waitForTransaction(tx.hash)
      console.log('Vote confirmed!')

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

  // Load marketplace data (all NFTs for sale)
  const loadMarketplace = useCallback(async () => {
    // For now, just load user NFTs
    // In practice, you'd load all NFTs available for sale
    await loadPhysicsData()
  }, [loadPhysicsData])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Load data when wallet connects/changes
  useEffect(() => {
    const connectedAccount = walletService.getConnectedAccount()
    if (connectedAccount) {
      loadPhysicsData()
      blockchainService.clearContracts()
    }
  }, [loadPhysicsData])

  return {
    state,
    mintNFT,
    createProposal,
    voteOnProposal,
    loadPhysicsData,
    loadMarketplace,
    clearError
  }
}

export default usePhysics