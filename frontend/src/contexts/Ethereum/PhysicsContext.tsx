
import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import {
  type PhysicsNFT,
  type PhysicsLaw,
  type PhysicsModification,
  type PhysicsEngine,
  PhysicsType,
  Rarity,
  ProposalStatus
} from '../../types/physics'
import { getHTSService } from '../../services/ethereum/token'
import { getSmartContractsService } from '../../services/ethereum/contracts'
import { useAccount } from './HederaContext'

interface PhysicsContextState {
  nfts: PhysicsNFT[]
  laws: PhysicsLaw[]
  modifications: PhysicsModification[]
  engine: PhysicsEngine | null
  isMinting: boolean
  isTrading: boolean
  isVoting: boolean
  physicsTokenAddress: string | null
  nftCollectionAddress: string | null
  error: string | null
}

type PhysicsAction =
  | { type: 'MINT_NFT_START' }
  | { type: 'MINT_NFT_SUCCESS'; payload: PhysicsNFT }
  | { type: 'MINT_NFT_ERROR'; payload: string }
  | { type: 'TRADE_NFT_START' }
  | { type: 'TRADE_NFT_SUCCESS'; payload: { nftId: string; newOwner: string } }
  | { type: 'TRADE_NFT_ERROR'; payload: string }
  | { type: 'LOAD_NFTS'; payload: PhysicsNFT[] }
  | { type: 'LOAD_LAWS'; payload: PhysicsLaw[] }
  | { type: 'LOAD_MODIFICATIONS'; payload: PhysicsModification[] }
  | { type: 'UPDATE_ENGINE'; payload: PhysicsEngine }
  | { type: 'VOTE_START' }
  | { type: 'VOTE_SUCCESS'; payload: PhysicsModification }
  | { type: 'VOTE_ERROR'; payload: string }
  | { type: 'SET_CONTRACT_ADDRESSES'; payload: { physicsTokenAddress: string; nftCollectionAddress: string } }
  | { type: 'CLEAR_ERROR' }

const initialState: PhysicsContextState = {
  nfts: [],
  laws: [],
  modifications: [],
  engine: null,
  isMinting: false,
  isTrading: false,
  isVoting: false,
  physicsTokenAddress: null,
  nftCollectionAddress: null,
  error: null
}

function physicsReducer(state: PhysicsContextState, action: PhysicsAction): PhysicsContextState {
  switch (action.type) {
    case 'MINT_NFT_START':
      return {
        ...state,
        isMinting: true,
        error: null
      }

    case 'MINT_NFT_SUCCESS':
      return {
        ...state,
        isMinting: false,
        nfts: [...state.nfts, action.payload],
        error: null
      }

    case 'MINT_NFT_ERROR':
      return {
        ...state,
        isMinting: false,
        error: action.payload
      }

    case 'TRADE_NFT_START':
      return {
        ...state,
        isTrading: true,
        error: null
      }

    case 'TRADE_NFT_SUCCESS':
      return {
        ...state,
        isTrading: false,
        nfts: state.nfts.map(nft =>
          nft.tokenId === action.payload.nftId
            ? { ...nft, owner: action.payload.newOwner }
            : nft
        ),
        error: null
      }

    case 'TRADE_NFT_ERROR':
      return {
        ...state,
        isTrading: false,
        error: action.payload
      }

    case 'LOAD_NFTS':
      return {
        ...state,
        nfts: action.payload
      }

    case 'LOAD_LAWS':
      return {
        ...state,
        laws: action.payload
      }

    case 'LOAD_MODIFICATIONS':
      return {
        ...state,
        modifications: action.payload
      }

    case 'UPDATE_ENGINE':
      return {
        ...state,
        engine: action.payload
      }

    case 'VOTE_START':
      return {
        ...state,
        isVoting: true,
        error: null
      }

    case 'VOTE_SUCCESS':
      return {
        ...state,
        isVoting: false,
        modifications: state.modifications.map(mod =>
          mod.proposalId === action.payload.proposalId ? action.payload : mod
        ),
        error: null
      }

    case 'VOTE_ERROR':
      return {
        ...state,
        isVoting: false,
        error: action.payload
      }

    case 'SET_CONTRACT_ADDRESSES':
      return {
        ...state,
        physicsTokenAddress: action.payload.physicsTokenAddress,
        nftCollectionAddress: action.payload.nftCollectionAddress
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }

    default:
      return state
  }
}

interface PhysicsContextType {
  state: PhysicsContextState
  mintPhysicsNFT: (physicsType: PhysicsType, rarity: Rarity, properties: any) => Promise<PhysicsNFT | null>
  tradeNFT: (nftId: string, toAddress: string, price: string) => Promise<boolean>
  proposePhysicsChange: (lawId: string, newValue: number, description: string) => Promise<boolean>
  voteOnProposal: (proposalId: string, vote: boolean, stakingAmount: number) => Promise<boolean>
  loadMarketplace: () => Promise<void>
  clearError: () => void
}

export const PhysicsContext = createContext<PhysicsContextType | undefined>(undefined)

interface PhysicsProviderProps {
  children: ReactNode
}

export function PhysicsProvider({ children }: PhysicsProviderProps) {
  const [state, dispatch] = useReducer(physicsReducer, initialState)
  const account = useAccount()

  useEffect(() => {
    if (account) {
      initializePhysicsSystem()
    }
  }, [account])

  const initializePhysicsSystem = async () => {
    try {
      // Set contract addresses from environment
      const physicsTokenAddress = import.meta.env.VITE_PHYSICS_TOKEN_ADDRESS
      const nftCollectionAddress = import.meta.env.VITE_PHYSICS_NFT_COLLECTION_ADDRESS

      if (physicsTokenAddress && nftCollectionAddress) {
        dispatch({ 
          type: 'SET_CONTRACT_ADDRESSES', 
          payload: { physicsTokenAddress, nftCollectionAddress } 
        })
      }

      // Load initial physics laws
      const laws = await loadPhysicsLaws()
      dispatch({ type: 'LOAD_LAWS', payload: laws })

      // Load physics engine state
      const engine = await loadPhysicsEngine()
      dispatch({ type: 'UPDATE_ENGINE', payload: engine })

      // Load marketplace NFTs
      await loadMarketplace()
    } catch (error) {
      console.error('Failed to initialize physics system:', error)
    }
  }

  const mintPhysicsNFT = async (
    physicsType: PhysicsType,
    rarity: Rarity,
    properties: any
  ): Promise<PhysicsNFT | null> => {
    if (!account || !state.nftCollectionAddress) {
      dispatch({ type: 'MINT_NFT_ERROR', payload: 'Services not initialized' })
      return null
    }

    dispatch({ type: 'MINT_NFT_START' })

    try {
      // Generate NFT metadata
      const name = `${rarity} ${physicsType} Controller`
      const metadata = getHTSService().generatePhysicsNFTMetadata(name, physicsType, rarity, properties)

      // Upload metadata to IPFS (simplified)
      const ipfsHash = await uploadToIPFS(metadata)
      const tokenURI = `https://ipfs.io/ipfs/${ipfsHash}`

      // Mint NFT using ERC721 standard
      const tokenIds = await getHTSService().mintPhysicsNFT(
        state.nftCollectionAddress,
        account.accountId, // to address
        [tokenURI]
      )

      const nft: PhysicsNFT = {
        tokenId: `${state.nftCollectionAddress}/${tokenIds[0]}`,
        name,
        description: `A ${rarity} ${physicsType} NFT that controls physical laws in QuantumVerse`,
        physicsType,
        properties: {
          magnitude: properties.magnitude || 1.0,
          duration: properties.duration || 60,
          range: properties.range || 10,
          cooldown: properties.cooldown || 30,
          energyCost: properties.energyCost || 10,
          compatibility: properties.compatibility || []
        },
        rarity,
        price: calculateNFTPrice(rarity, physicsType),
        owner: account.accountId,
        metadata: {
          image: `https://quantumverse.ethereum.com/nft/${physicsType.toLowerCase()}.png`,
          attributes: [],
          creator: 'QuantumVerse',
          createdAt: new Date(),
          ipfsHash
        },
        effects: generatePhysicsEffects(physicsType, properties)
      }

      dispatch({ type: 'MINT_NFT_SUCCESS', payload: nft })
      return nft
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'NFT minting failed'
      dispatch({ type: 'MINT_NFT_ERROR', payload: errorMessage })
      return null
    }
  }

  const tradeNFT = async (nftId: string, toAddress: string, price: string): Promise<boolean> => {
    if (!account) {
      dispatch({ type: 'TRADE_NFT_ERROR', payload: 'No account connected' })
      return false
    }

    dispatch({ type: 'TRADE_NFT_START' })

    try {
      const [contractAddress, tokenIdStr] = nftId.split('/')
      const tokenId = parseInt(tokenIdStr)

      // Transfer NFT using ERC721 standard (simplified - in practice you'd handle payment too)
      const success = await getHTSService().transferNFT(
        contractAddress,
        tokenId,
        account.accountId,
        toAddress
      )

      if (success) {
        dispatch({ type: 'TRADE_NFT_SUCCESS', payload: { nftId, newOwner: toAddress } })
        return true
      }

      throw new Error('NFT transfer failed')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'NFT trading failed'
      dispatch({ type: 'TRADE_NFT_ERROR', payload: errorMessage })
      return false
    }
  }

  const proposePhysicsChange = async (
    lawId: string,
    newValue: number,
    description: string
  ): Promise<boolean> => {
    try {
      const contractAddress = import.meta.env.VITE_PHYSICS_GOVERNANCE_CONTRACT_ADDRESS
      if (!contractAddress) {
        throw new Error('Physics governance contract not configured')
      }

      await getSmartContractsService().proposePhysicsChange(
        contractAddress,
        lawId,
        newValue,
        description
      )

      return true
    } catch (error) {
      console.error('Failed to propose physics change:', error)
      return false
    }
  }

  const voteOnProposal = async (
    proposalId: string,
    vote: boolean,
    stakingAmount: number
  ): Promise<boolean> => {
    if (!state.physicsTokenAddress) {
      dispatch({ type: 'VOTE_ERROR', payload: 'Physics token not available' })
      return false
    }

    dispatch({ type: 'VOTE_START' })

    try {
      const contractAddress = import.meta.env.VITE_PHYSICS_GOVERNANCE_CONTRACT_ADDRESS
      if (!contractAddress) {
        throw new Error('Physics governance contract not configured')
      }

      await getSmartContractsService().voteOnProposal(
        contractAddress,
        proposalId,
        vote,
        stakingAmount
      )

      // Update modification in state
      const updatedModification: PhysicsModification = {
        lawId: 'gravity',
        proposalId,
        modifier: account!.accountId,
        newValue: 0.8,
        votes: stakingAmount,
        status: ProposalStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }

      dispatch({ type: 'VOTE_SUCCESS', payload: updatedModification })
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Voting failed'
      dispatch({ type: 'VOTE_ERROR', payload: errorMessage })
      return false
    }
  }

  const loadMarketplace = async (): Promise<void> => {
    try {
      // In a real implementation, this would fetch from blockchain events or subgraph
      const mockNFTs: PhysicsNFT[] = [
        {
          tokenId: '0x1234567890123456789012345678901234567890/1',
          name: 'Epic Gravity Manipulator',
          description: 'Controls gravity in a localized area',
          physicsType: PhysicsType.GRAVITY,
          properties: {
            magnitude: 0.8,
            duration: 120,
            range: 15,
            cooldown: 60,
            energyCost: 25,
            compatibility: [PhysicsType.SPACE, PhysicsType.MATTER]
          },
          rarity: Rarity.EPIC,
          price: '0.15', // ETH
          owner: '0x742d35Cc6634C0532925a3b8D6EbDc3f6DbC0C1b',
          metadata: {
            image: 'https://quantumverse.ethereum.com/nft/gravity.png',
            attributes: [],
            creator: 'QuantumVerse',
            createdAt: new Date(),
            ipfsHash: 'QmGravityNFT123'
          },
          effects: []
        }
      ]

      dispatch({ type: 'LOAD_NFTS', payload: mockNFTs })
    } catch (error) {
      console.error('Failed to load marketplace:', error)
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const contextValue: PhysicsContextType = {
    state,
    mintPhysicsNFT,
    tradeNFT,
    proposePhysicsChange,
    voteOnProposal,
    loadMarketplace,
    clearError
  }

  return (
    <PhysicsContext.Provider value={contextValue}>
      {children}
    </PhysicsContext.Provider>
  )
}

export function usePhysics(): PhysicsContextType {
  const context = useContext(PhysicsContext)
  if (context === undefined) {
    throw new Error('usePhysics must be used within a PhysicsProvider')
  }
  return context
}

// Utility functions (adapted for Ethereum)
async function loadPhysicsLaws(): Promise<PhysicsLaw[]> {
  return [
    {
      id: 'gravity',
      name: 'Gravitational Constant',
      description: 'Controls the strength of gravity in all realities',
      formula: 'F = G * (m1 * m2) / r²',
      constants: { G: 9.81 },
      applicableRealities: ['VIRTUAL', 'AUGMENTED', 'MIXED'] as any,
      governanceTokens: 1000
    },
    {
      id: 'time',
      name: 'Temporal Flow Rate',
      description: 'Controls the passage of time in virtual realities',
      formula: 'dt = dt0 * flow_rate',
      constants: { flow_rate: 1.0 },
      applicableRealities: ['VIRTUAL'] as any,
      governanceTokens: 2000
    }
  ]
}

async function loadPhysicsEngine(): Promise<PhysicsEngine> {
  return {
    laws: await loadPhysicsLaws(),
    activeModifications: [],
    currentConstants: {
      gravity: 9.81,
      time_flow: 1.0,
      energy_conservation: 1.0
    },
    realityStates: {
      VIRTUAL: {
        gravity: 9.81,
        timeFlow: 1.0,
        energy: 100,
        temperature: 20,
        pressure: 1.0,
        electromagnetics: 1.0
      },
      AUGMENTED: {
        gravity: 9.81,
        timeFlow: 1.0,
        energy: 100,
        temperature: 22,
        pressure: 1.0,
        electromagnetics: 1.0
      },
      PHYSICAL: {
        gravity: 9.81,
        timeFlow: 1.0,
        energy: 100,
        temperature: 25,
        pressure: 1.0,
        electromagnetics: 1.0
      },
      MIXED: {
        gravity: 9.81,
        timeFlow: 1.0,
        energy: 100,
        temperature: 23,
        pressure: 1.0,
        electromagnetics: 1.0
      }
    }
  }
}

function calculateNFTPrice(rarity: Rarity, physicsType: PhysicsType): string {
  const basePrice = 0.05 // ETH
  const rarityMultiplier = {
    [Rarity.COMMON]: 1,
    [Rarity.UNCOMMON]: 2,
    [Rarity.RARE]: 4,
    [Rarity.EPIC]: 8,
    [Rarity.LEGENDARY]: 16,
    [Rarity.MYTHIC]: 32
  }

  const typeMultiplier = {
    [PhysicsType.GRAVITY]: 1.2,
    [PhysicsType.TIME]: 2.0,
    [PhysicsType.QUANTUM_FIELD]: 3.0,
    [PhysicsType.WEATHER]: 1.0,
    [PhysicsType.MATTER]: 1.5,
    [PhysicsType.ENERGY]: 1.3,
    [PhysicsType.SPACE]: 1.8
  }

  return (basePrice * rarityMultiplier[rarity] * typeMultiplier[physicsType]).toFixed(4)
}

function generatePhysicsEffects(physicsType: PhysicsType, properties: any): any[] {
  // Generate visual and mechanical effects based on physics type
  return []
}

async function uploadToIPFS(metadata: string): Promise<string> {
  // This would upload to IPFS in a real implementation
  // Could use services like Pinata, NFT.Storage, or Web3.Storage
  return `QmMockIPFS${Date.now()}`
}