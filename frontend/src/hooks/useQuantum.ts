import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { blockchainService } from '../services/hedera/blockchain'
import { walletService } from '../services/hedera/wallet'

export interface QuantumIdentity {
  quantumDNA: string
  securityLevel: number
  createdAt: number
  isActive: boolean
  achievements: string[]
}

export interface QuantumEntanglement {
  id: string
  pairA: {
    address: string
    realityType: string
  }
  pairB: {
    address: string
    realityType: string
  }
  entanglementStrength: number
  isActive: boolean
  lastSync: number
  correlationHistory: number[]
}

export interface QuantumState {
  isLoading: boolean
  error: string | null
  identity: QuantumIdentity | null
  entanglements: QuantumEntanglement[]
  tokenBalance: string
  isGeneratingIdentity: boolean
}

export const useQuantum = () => {
  const [state, setState] = useState<QuantumState>({
    isLoading: false,
    error: null,
    identity: null,
    entanglements: [],
    tokenBalance: '0',
    isGeneratingIdentity: false
  })

  // Load user's quantum data from blockchain
  const loadQuantumData = useCallback(async () => {
    if (!blockchainService.isConnected()) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const account = blockchainService.getAccount()
      if (!account) throw new Error('No account connected')

      // Get contracts
      const quantumContract = blockchainService.getContract('QuantumToken')
      const entanglementContract = blockchainService.getContract('QuantumEntanglementContract')

      if (!quantumContract || !entanglementContract) {
        throw new Error('Failed to connect to contracts')
      }

      // Convert account to EVM address
      const evmAddress = blockchainService.accountIdToAddress(account)

      // Load quantum token balance
      let formattedBalance = '0'
      try {
        const balance = await quantumContract.balanceOf(evmAddress)
        formattedBalance = ethers.utils.formatUnits(balance, 8) // QUANTUM has 8 decimals
      } catch (error) {
        console.warn('Failed to load quantum token balance:', error)
        // Keep default '0'
      }

      // Load quantum identity
      let identity: QuantumIdentity | null = null
      try {
        const identityData = await quantumContract.getQuantumIdentity(evmAddress)

        if (identityData.isActive) {
          identity = {
            quantumDNA: identityData.quantumDNA,
            securityLevel: identityData.securityLevel.toNumber(),
            createdAt: identityData.createdAt.toNumber() * 1000, // Convert to JS timestamp
            isActive: identityData.isActive,
            achievements: [] // Load from separate contract or storage if needed
          }
        }
      } catch (error) {
        console.log('No quantum identity found (this is normal for new users)')
      }

      // Load entanglements
      const entanglementIds = await entanglementContract.getUserEntanglements(evmAddress)
      const entanglements: QuantumEntanglement[] = []

      for (const id of entanglementIds) {
        try {
          const entanglementData = await entanglementContract.getEntanglement(id)

          entanglements.push({
            id: id,
            pairA: {
              address: entanglementData.pairA,
              realityType: 'Virtual' // This could be stored in contract or derived
            },
            pairB: {
              address: entanglementData.pairB,
              realityType: 'Augmented'
            },
            entanglementStrength: entanglementData.strength.toNumber() / 100, // Convert to percentage
            isActive: entanglementData.isActive,
            lastSync: entanglementData.lastSync.toNumber() * 1000,
            correlationHistory: [] // Load from events or separate storage
          })
        } catch (error) {
          console.warn(`Failed to load entanglement ${id}:`, error)
        }
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        identity,
        entanglements,
        tokenBalance: formattedBalance
      }))

    } catch (error) {
      console.error('Failed to load quantum data:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message
      }))
    }
  }, [])

  // Generate quantum identity on blockchain
  const generateIdentity = useCallback(async (): Promise<boolean> => {
    if (!blockchainService.isConnected()) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
      return false
    }

    setState(prev => ({ ...prev, isGeneratingIdentity: true, error: null }))

    try {
      const account = blockchainService.getAccount()
      const quantumContract = blockchainService.getContract('QuantumToken')

      if (!account || !quantumContract) {
        throw new Error('Failed to connect to contract')
      }

      const evmAddress = blockchainService.accountIdToAddress(account)

      // Call smart contract to generate identity
      const tx = await quantumContract.generateQuantumIdentity(evmAddress)
      console.log('Transaction sent:', tx.hash)

      // Wait for transaction confirmation
      await blockchainService.waitForTransaction(tx.hash)
      console.log('Identity generation confirmed!')

      // Reload quantum data to show new identity
      await loadQuantumData()

      setState(prev => ({ ...prev, isGeneratingIdentity: false }))
      return true

    } catch (error) {
      console.error('Failed to generate identity:', error)
      setState(prev => ({
        ...prev,
        isGeneratingIdentity: false,
        error: (error as Error).message
      }))
      return false
    }
  }, [loadQuantumData])

  // Create quantum entanglement
  const createEntanglement = useCallback(async (assetA: string, assetB: string, strength: number): Promise<boolean> => {
    if (!blockchainService.isConnected()) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
      return false
    }

    try {
      const entanglementContract = blockchainService.getContract('QuantumEntanglementContract')
      if (!entanglementContract) throw new Error('Failed to connect to contract')

      // Create entanglement on blockchain
      const tx = await entanglementContract.createEntanglement(assetA, assetB, strength * 100) // Convert percentage to integer
      console.log('Entanglement creation sent:', tx.hash)

      await blockchainService.waitForTransaction(tx.hash)
      console.log('Entanglement created!')

      // Reload data to show new entanglement
      await loadQuantumData()
      return true

    } catch (error) {
      console.error('Failed to create entanglement:', error)
      setState(prev => ({ ...prev, error: (error as Error).message }))
      return false
    }
  }, [loadQuantumData])

  // Sync entanglement
  const syncEntanglement = useCallback(async (entanglementId: string): Promise<boolean> => {
    if (!blockchainService.isConnected()) return false

    try {
      const entanglementContract = blockchainService.getContract('QuantumEntanglementContract')
      if (!entanglementContract) throw new Error('Failed to connect to contract')

      const tx = await entanglementContract.syncEntanglement(entanglementId)
      await blockchainService.waitForTransaction(tx.hash)

      // Reload data to show updated sync time
      await loadQuantumData()
      return true

    } catch (error) {
      console.error('Failed to sync entanglement:', error)
      setState(prev => ({ ...prev, error: (error as Error).message }))
      return false
    }
  }, [loadQuantumData])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Load data when wallet connects/changes
  useEffect(() => {
    const connectedAccount = walletService.getConnectedAccount()
    if (connectedAccount) {
      loadQuantumData()

      // Clear contracts cache when wallet changes
      blockchainService.clearContracts()
    }
  }, [loadQuantumData])

  // Refresh data periodically (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (blockchainService.isConnected() && !state.isLoading) {
        loadQuantumData()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [loadQuantumData, state.isLoading])

  return {
    state,
    generateIdentity,
    createEntanglement,
    syncEntanglement,
    loadQuantumData,
    clearError
  }
}

export default useQuantum