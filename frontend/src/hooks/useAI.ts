import { useState, useEffect, useCallback } from 'react'
import { blockchainService } from '../services/ethereum/blockchain'
import { walletService } from '../services/ethereum/wallet'
import { ethers } from 'ethers'

export enum EntityType {
  COMPANION = 0,
  GUARDIAN = 1,
  TRADER = 2,
  EXPLORER = 3,
  CREATOR = 4,
  SCIENTIST = 5
}

export interface AIEntity {
  id: number
  creator: string
  type: EntityType
  name: string
  intelligence: number
  autonomy: number
  reputation: number
  isActive: boolean

  // Computed properties
  behavior: {
    currentAction?: {
      type: string
      status: 'IDLE' | 'EXECUTING' | 'COMPLETED'
      startTime: number
      description: string
    }
    lastDecision: number
  }

  evolution: {
    level: number
    experience: number
    nextLevelRequirement: number
  }

  earnings: {
    totalEarned: string
    currentBalance: string
    lastEarning: number
  }

  createdAt: number
}

export interface AIState {
  isLoading: boolean
  error: string | null
  entities: AIEntity[]
  userEntities: AIEntity[]
  isCreating: boolean
  selectedEntity: AIEntity | null
}

export const useAI = () => {
  const [state, setState] = useState<AIState>({
    isLoading: false,
    error: null,
    entities: [],
    userEntities: [],
    isCreating: false,
    selectedEntity: null
  })

  // Load AI entities from blockchain
const loadAIData = useCallback(async () => {
  if (!blockchainService.isConnected()) return

  setState(prev => ({ ...prev, isLoading: true, error: null }))

  try {
    const accountId = blockchainService.getAccount()
    if (!accountId) throw new Error('No account connected')
    console.log("Account connected for AI CONTRACT")

    const aiContract = await blockchainService.getContract('AIEntityContract')
    console.log(aiContract, "Aicontract")
    if (!aiContract) throw new Error('Failed to connect to AI contract')

    const evmAddress = blockchainService.accountIdToAddress(accountId)
    console.log("User address:", evmAddress)
    
    // Get user's entities with proper error handling
    let userEntityIds: bigint[] = []
    try {
      const result = await aiContract.getUserEntities(evmAddress)
      userEntityIds = Array.isArray(result) ? result : []
      console.log("Raw entity IDs from contract:", userEntityIds)
      console.log("Number of entities found:", userEntityIds.length)
    } catch (error: any) {
      if (error.code === 'BAD_DATA' || error.message.includes('could not decode result data')) {
        console.log("User has no AI entities yet (empty result)")
        userEntityIds = []
      } else {
        console.error("Error getting user entities:", error)
        throw error
      }
    }
    
    // Handle case where user has no entities
    if (!userEntityIds || userEntityIds.length === 0) {
      console.log("User has no AI entities")
      setState(prev => ({
        ...prev,
        isLoading: false,
        entities: [],
        userEntities: []
      }))
      return
    }

    const userEntities: AIEntity[] = []

    // Process each entity
    for (let i = 0; i < userEntityIds.length; i++) {
      const entityIdBigInt = userEntityIds[i]
      const entityId = Number(entityIdBigInt)
      
      console.log(`Processing entity ${i + 1}/${userEntityIds.length}: ID ${entityId}`)
      
      try {
        const entityData = await aiContract.getEntity(entityId)
        console.log("Raw entity data from contract:", entityData)

        // Create the entity object with proper field mapping
        const entity: AIEntity = {
          id: Number(entityData.id),
          creator: entityData.creator,
          type: Number(entityData.entityType),
          name: entityData.name,
          intelligence: Number(entityData.intelligence),
          autonomy: Number(entityData.autonomy), 
          reputation: Number(entityData.reputation),
          isActive: entityData.isActive,

          // Computed properties
          behavior: {
            currentAction: {
              type: 'analyzing_market',
              status: Math.random() > 0.5 ? 'EXECUTING' : 'IDLE',
              startTime: Date.now() - Math.random() * 3600000,
              description: 'Analyzing quantum market trends'
            },
            lastDecision: Date.now() - Math.random() * 86400000
          },

          evolution: {
            level: Number(entityData.level),
            experience: Number(entityData.experience),
            nextLevelRequirement: Number(entityData.level) * 1000
          },

          earnings: {
            totalEarned: (Math.random() * 1000).toFixed(2),
            currentBalance: (Math.random() * 100).toFixed(2),
            lastEarning: Date.now() - Math.random() * 86400000
          },

          createdAt: Number(entityData.createdAt) * 1000 // Convert to JS timestamp
        }

        console.log("Processed entity:", entity)
        userEntities.push(entity)
        
      } catch (error) {
        console.error(`Failed to load entity ${entityId}:`, error)
        // Continue with other entities even if one fails
      }
    }

    console.log("Final processed entities:", userEntities)

    setState(prev => ({
      ...prev,
      isLoading: false,
      entities: userEntities,
      userEntities: userEntities
    }))

    console.log("State updated with entities:", userEntities.length)

  } catch (error) {
    console.error('Failed to load AI data:', error)
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: (error as Error).message
    }))
  }
}, [])





  // Create new AI entity on blockchain
const createEntity = useCallback(async (type: EntityType, name: string): Promise<AIEntity | null> => {
  if (!blockchainService.isConnected()) {
    setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
    return null
  }

  setState(prev => ({ ...prev, isCreating: true, error: null }))

  try {
    const aiContract = await blockchainService.getContract('AIEntityContract')
    
    if (!aiContract) {
      throw new Error('Failed to connect to AI contract')
    }

    // ✅ Fixed: Direct cast to number
    const entityTypeNumber = type as number
    
    console.log('Creating entity with type:', EntityType[type], 'Number:', entityTypeNumber)

    const tx = await aiContract.createAIEntity(
      name,
      entityTypeNumber,
      "Default personality",
      "General knowledge"
    )
    
    console.log('AI entity creation transaction sent:', tx.hash)

    const receipt = await tx.wait()
    if (receipt.status !== 1) {
      throw new Error('Transaction failed')
    }
    console.log('AI entity created successfully!')

    await new Promise(resolve => setTimeout(resolve, 2000))
    await loadAIData()

    setState(prev => ({ ...prev, isCreating: false }))
    return state.userEntities.find(e => e.name === name) || null

  } catch (error: any) {
    console.error('Failed to create AI entity:', error)
    setState(prev => ({
      ...prev,
      isCreating: false,
      error: error.message || 'Unknown error occurred'
    }))
    return null
  }
}, [loadAIData, state.userEntities])










  // Update entity behavior
  const updateEntityBehavior = useCallback(async (entityId: number, action: string): Promise<boolean> => {
    if (!blockchainService.isConnected()) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
      return false
    }

    try {
      const aiContract = blockchainService.getContract('AIEntityContract')
      if (!aiContract) throw new Error('Failed to connect to AI contract')

      const tx = await aiContract.updateEntityBehavior(entityId, action)
      console.log('Entity behavior update sent:', tx.hash)

      await blockchainService.waitForTransaction(tx.hash)
      console.log('Entity behavior updated!')

      await loadAIData()
      return true

    } catch (error) {
      console.error('Failed to update entity behavior:', error)
      setState(prev => ({ ...prev, error: (error as Error).message }))
      return false
    }
  }, [loadAIData])

  // Select entity for detailed view
  const selectEntity = useCallback((entity: AIEntity | null) => {
    setState(prev => ({ ...prev, selectedEntity: entity }))
  }, [])

  // Refresh entities data
  const refreshEntities = useCallback(async () => {
    await loadAIData()
  }, [loadAIData])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Load data when wallet connects/changes
  useEffect(() => {
    const connectedAccount = walletService.getConnectedAccount()
    if (connectedAccount) {
      loadAIData()
      blockchainService.clearContracts()
    }
  }, [loadAIData])

  // Auto-refresh entities every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (blockchainService.isConnected() && !state.isLoading) {
        loadAIData()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [loadAIData, state.isLoading])

  return {
    entities: state.entities,
    userEntities: state.userEntities,
    isLoading: state.isLoading,
    error: state.error,
    isCreating: state.isCreating,
    selectedEntity: state.selectedEntity,
    createEntity,
    updateEntityBehavior,
    selectEntity,
    refreshEntities,
    clearError
  }
}

export default useAI