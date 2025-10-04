import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import {
  type QuantumIdentity,
  type QuantumEntanglement,
  type QuantumState,
  SecurityLevel,
  RealityType,
  SyncStatus
} from '../types/quantum'
import { getHCSService } from '../services/hedera/hcs'
import { getSmartContractsService } from '../services/hedera/smart-contracts'
import { useAccount } from './HederaContext'

interface QuantumContextState {
  identity: QuantumIdentity | null
  entanglements: QuantumEntanglement[]
  isGeneratingIdentity: boolean
  isCreatingEntanglement: boolean
  isSyncing: boolean
  quantumTopicId: string | null
  error: string | null
}

type QuantumAction =
  | { type: 'GENERATE_IDENTITY_START' }
  | { type: 'GENERATE_IDENTITY_SUCCESS'; payload: QuantumIdentity }
  | { type: 'GENERATE_IDENTITY_ERROR'; payload: string }
  | { type: 'CREATE_ENTANGLEMENT_START' }
  | { type: 'CREATE_ENTANGLEMENT_SUCCESS'; payload: QuantumEntanglement }
  | { type: 'CREATE_ENTANGLEMENT_ERROR'; payload: string }
  | { type: 'UPDATE_ENTANGLEMENT'; payload: QuantumEntanglement }
  | { type: 'SYNC_START' }
  | { type: 'SYNC_SUCCESS' }
  | { type: 'SYNC_ERROR'; payload: string }
  | { type: 'SET_TOPIC_ID'; payload: string }
  | { type: 'CLEAR_ERROR' }

const initialState: QuantumContextState = {
  identity: null,
  entanglements: [],
  isGeneratingIdentity: false,
  isCreatingEntanglement: false,
  isSyncing: false,
  quantumTopicId: null,
  error: null
}

function quantumReducer(state: QuantumContextState, action: QuantumAction): QuantumContextState {
  switch (action.type) {
    case 'GENERATE_IDENTITY_START':
      return {
        ...state,
        isGeneratingIdentity: true,
        error: null
      }

    case 'GENERATE_IDENTITY_SUCCESS':
      return {
        ...state,
        isGeneratingIdentity: false,
        identity: action.payload,
        error: null
      }

    case 'GENERATE_IDENTITY_ERROR':
      return {
        ...state,
        isGeneratingIdentity: false,
        error: action.payload
      }

    case 'CREATE_ENTANGLEMENT_START':
      return {
        ...state,
        isCreatingEntanglement: true,
        error: null
      }

    case 'CREATE_ENTANGLEMENT_SUCCESS':
      return {
        ...state,
        isCreatingEntanglement: false,
        entanglements: [...state.entanglements, action.payload],
        error: null
      }

    case 'CREATE_ENTANGLEMENT_ERROR':
      return {
        ...state,
        isCreatingEntanglement: false,
        error: action.payload
      }

    case 'UPDATE_ENTANGLEMENT':
      return {
        ...state,
        entanglements: state.entanglements.map(e =>
          e.id === action.payload.id ? action.payload : e
        )
      }

    case 'SYNC_START':
      return {
        ...state,
        isSyncing: true,
        error: null
      }

    case 'SYNC_SUCCESS':
      return {
        ...state,
        isSyncing: false,
        error: null
      }

    case 'SYNC_ERROR':
      return {
        ...state,
        isSyncing: false,
        error: action.payload
      }

    case 'SET_TOPIC_ID':
      return {
        ...state,
        quantumTopicId: action.payload
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

interface QuantumContextType {
  state: QuantumContextState
  generateQuantumIdentity: () => Promise<QuantumIdentity | null>
  createEntanglement: (assetIdA: string, assetIdB: string, realityTypeA: RealityType, realityTypeB: RealityType) => Promise<QuantumEntanglement | null>
  synchronizeEntanglement: (entanglementId: string, newState: any) => Promise<boolean>
  measureQuantumState: (identityId: string) => Promise<QuantumState | null>
  clearError: () => void
}

export const QuantumContext = createContext<QuantumContextType | undefined>(undefined)

interface QuantumProviderProps {
  children: ReactNode
}

export function QuantumProvider({ children }: QuantumProviderProps) {
  const [state, dispatch] = useReducer(quantumReducer, initialState)
  const account = useAccount()

  useEffect(() => {
    if (account) {
      initializeQuantumServices()
    }
  }, [account])

  const initializeQuantumServices = async () => {
    try {
      // Create or get quantum topic for this user
      const topicId = await getHCSService().createTopic(
        `QuantumVerse-${account?.accountId}-quantum-sync`
      )
      dispatch({ type: 'SET_TOPIC_ID', payload: topicId })

      // Subscribe to quantum sync messages
      getHCSService().subscribeToTopic(topicId, handleQuantumMessage)
    } catch (error) {
      console.error('Failed to initialize quantum services:', error)
    }
  }

  const handleQuantumMessage = (message: any) => {
    try {
      const data = JSON.parse(message.message)

      if (data.type === 'ENTANGLEMENT_SYNC') {
        // Update entanglement state
        const entanglement = state.entanglements.find(e => e.id === data.entanglementId)
        if (entanglement) {
          const updatedEntanglement: QuantumEntanglement = {
            ...entanglement,
            lastSync: new Date(),
            synchronizationStatus: SyncStatus.SYNCHRONIZED
          }
          dispatch({ type: 'UPDATE_ENTANGLEMENT', payload: updatedEntanglement })
        }
      }
    } catch (error) {
      console.error('Failed to process quantum message:', error)
    }
  }

  const generateQuantumIdentity = async (): Promise<QuantumIdentity | null> => {
    if (!account) {
      dispatch({ type: 'GENERATE_IDENTITY_ERROR', payload: 'No account connected' })
      return null
    }

    dispatch({ type: 'GENERATE_IDENTITY_START' })

    try {
      // Generate quantum DNA using cryptographic randomness
      const entropy = crypto.getRandomValues(new Uint32Array(1))[0] / (2**32)
      const quantumState: QuantumState = {
        superposition: Math.random(),
        entanglement: Math.random(),
        coherence: Math.random(),
        measurement: new Date()
      }

      // Create quantum fingerprint
      const fingerprint = await generateQuantumFingerprint(account.accountId)

      const identity: QuantumIdentity = {
        id: `quantum-${account.accountId}-${Date.now()}`,
        quantumDNA: {
          signature: fingerprint,
          entropy,
          quantumState,
          biometricHash: await generateBiometricHash(),
          encryptionLevel: 256
        },
        securityLevel: SecurityLevel.QUANTUM,
        crossRealityFingerprint: fingerprint,
        createdAt: new Date(),
        lastVerified: new Date(),
        achievements: []
      }

      dispatch({ type: 'GENERATE_IDENTITY_SUCCESS', payload: identity })
      return identity
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Identity generation failed'
      dispatch({ type: 'GENERATE_IDENTITY_ERROR', payload: errorMessage })
      return null
    }
  }

  const createEntanglement = async (
    assetIdA: string,
    assetIdB: string,
    realityTypeA: RealityType,
    realityTypeB: RealityType
  ): Promise<QuantumEntanglement | null> => {
    if (!account || !state.quantumTopicId) {
      dispatch({ type: 'CREATE_ENTANGLEMENT_ERROR', payload: 'Services not initialized' })
      return null
    }

    dispatch({ type: 'CREATE_ENTANGLEMENT_START' })

    try {
      const entanglementId = `entangle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create entanglement on smart contract
      const contractId = import.meta.env.VITE_QUANTUM_ENTANGLEMENT_CONTRACT
      if (contractId) {
        await getSmartContractsService().createEntanglement(
          contractId,
          assetIdA,
          assetIdB,
          ['HEALTH', 'EXPERIENCE', 'POSITION']
        )
      }

      const entanglement: QuantumEntanglement = {
        id: entanglementId,
        pairA: {
          assetId: assetIdA,
          assetType: 'CHARACTER' as any,
          realityType: realityTypeA,
          currentState: {},
          ownerId: account.accountId
        },
        pairB: {
          assetId: assetIdB,
          assetType: 'CHARACTER' as any,
          realityType: realityTypeB,
          currentState: {},
          ownerId: account.accountId
        },
        entanglementStrength: Math.random() * 0.3 + 0.7, // 70-100%
        synchronizationStatus: SyncStatus.SYNCHRONIZED,
        lastSync: new Date(),
        properties: [
          { name: 'HEALTH', type: 'HEALTH' as any, bidirectional: true, syncDelay: 100 },
          { name: 'EXPERIENCE', type: 'EXPERIENCE' as any, bidirectional: true, syncDelay: 500 },
          { name: 'POSITION', type: 'POSITION' as any, bidirectional: false, syncDelay: 50 }
        ]
      }

      dispatch({ type: 'CREATE_ENTANGLEMENT_SUCCESS', payload: entanglement })
      return entanglement
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Entanglement creation failed'
      dispatch({ type: 'CREATE_ENTANGLEMENT_ERROR', payload: errorMessage })
      return null
    }
  }

  const synchronizeEntanglement = async (entanglementId: string, newState: any): Promise<boolean> => {
    if (!state.quantumTopicId) {
      return false
    }

    dispatch({ type: 'SYNC_START' })

    try {
      // Submit sync message to HCS
      await getHCSService().submitEntanglementSync(
        state.quantumTopicId,
        entanglementId,
        'assetA', // This should be determined dynamically
        newState
      )

      // Update smart contract if available
      const contractId = import.meta.env.VITE_QUANTUM_ENTANGLEMENT_CONTRACT
      if (contractId) {
        await getSmartContractsService().synchronizeEntanglement(
          contractId,
          entanglementId,
          JSON.stringify(newState)
        )
      }

      dispatch({ type: 'SYNC_SUCCESS' })
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Synchronization failed'
      dispatch({ type: 'SYNC_ERROR', payload: errorMessage })
      return false
    }
  }

  const measureQuantumState = async (identityId: string): Promise<QuantumState | null> => {
    try {
      // Quantum measurement affects the state (Heisenberg principle simulation)
      const quantumState: QuantumState = {
        superposition: Math.random(), // Collapses on measurement
        entanglement: state.entanglements.length > 0 ? 0.8 : 0.2,
        coherence: Math.random() * 0.5 + 0.5, // Maintains some coherence
        measurement: new Date()
      }

      return quantumState
    } catch (error) {
      console.error('Quantum measurement failed:', error)
      return null
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const contextValue: QuantumContextType = {
    state,
    generateQuantumIdentity,
    createEntanglement,
    synchronizeEntanglement,
    measureQuantumState,
    clearError
  }

  return (
    <QuantumContext.Provider value={contextValue}>
      {children}
    </QuantumContext.Provider>
  )
}

export function useQuantum(): QuantumContextType {
  const context = useContext(QuantumContext)
  if (context === undefined) {
    throw new Error('useQuantum must be used within a QuantumProvider')
  }
  return context
}

// Utility functions
async function generateQuantumFingerprint(accountId: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`${accountId}-${Date.now()}-${Math.random()}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function generateBiometricHash(): Promise<string> {
  // This would integrate with actual biometric data in a real implementation
  const mockBiometric = `biometric-${Math.random()}-${Date.now()}`
  const encoder = new TextEncoder()
  const data = encoder.encode(mockBiometric)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}