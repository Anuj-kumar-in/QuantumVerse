import { useState, useEffect, useCallback } from 'react'
import { blockchainService } from '../services/ethereum/blockchain'
import { walletService } from '../services/ethereum/wallet'

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

      const aiContract = blockchainService.getContract('AIEntityContract')
      console.log(aiContract,"Aicontract")
      if (!aiContract) throw new Error('Failed to connect to AI contract')

      const evmAddress = blockchainService.accountIdToAddress(accountId)
      console.log(evmAddress)
      // Get user's entities
      const userEntityIds = await aiContract.getUserEntities(`${evmAddress}`)
console.log("userEntitiesIds",userEntityIds)
      console.log(userEntityIds,"UserEntityID")
      const userEntities: AIEntity[] = []

      for (const entityId of userEntityIds) {
        try {
          const entityData = await aiContract.getEntity(entityId)

          const entity: AIEntity = {
            id: entityData.id.toNumber(),
            creator: entityData.creator,
            type: entityData.entityType,
            name: entityData.name,
            intelligence: entityData.intelligence.toNumber(),
            autonomy: entityData.autonomy.toNumber(), 
            reputation: entityData.reputation.toNumber(),
            isActive: entityData.isActive,

            // Computed properties (in practice, load from events or separate storage)
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
              level: Math.floor(entityData.intelligence.toNumber() / 100) + 1,
              experience: entityData.intelligence.toNumber(),
              nextLevelRequirement: (Math.floor(entityData.intelligence.toNumber() / 100) + 1) * 100
            },

            earnings: {
              totalEarned: (Math.random() * 1000).toFixed(2),
              currentBalance: (Math.random() * 100).toFixed(2),
              lastEarning: Date.now() - Math.random() * 86400000
            },

            createdAt: Date.now() - Math.random() * 7776000000 // Random creation time within 90 days
          }

          userEntities.push(entity)
        } catch (error) {
          console.warn(`Failed to load entity ${entityId}:`, error)
        }
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        entities: userEntities, // For marketplace, you'd load all entities
        userEntities
      }))

    }
        catch (error) {
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
      const aiContract = blockchainService.getContract('AIEntityContract')
      if (!aiContract) throw new Error('Failed to connect to AI contract')

      // Create entity on blockchain
      const tx = await aiContract.createAIEntity(type, name)
      console.log('AI entity creation sent:', tx.hash)

      const receipt = await blockchainService.waitForTransaction(tx.hash)
      console.log('AI entity created!')

      // Get the new entity ID from events (simplified)
      const entityId = receipt && receipt.logs.length > 0 ? receipt.logs[0].topics[1] : Date.now()

      // Load updated data
      await loadAIData()

      // Find and return the newly created entity
      const newEntity = state.userEntities.find(e => e.name === name)

      setState(prev => ({ ...prev, isCreating: false }))
      return newEntity || null

    } catch (error) {
      console.error('Failed to create AI entity:', error)
      setState(prev => ({
        ...prev,
        isCreating: false,
        error: (error as Error).message
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