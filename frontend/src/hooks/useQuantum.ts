import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { blockchainService } from '../services/ethereum/blockchain'
import { walletService } from '../services/ethereum/wallet'

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

// Utility functions for safe contract interaction
const assertHasCode = async (provider: ethers.Provider, address: string) => {
  const code = await provider.getCode(address)
  if (code === '0x') {
    const network = await provider.getNetwork()
    throw new Error(`No contract code at ${address} on chain ${network.chainId}`)
  }
}

const safeCall = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await fn()
  } catch (err: any) {
    if (err.code === 'BAD_DATA' || err.code === 'CALL_EXCEPTION') {
      console.warn('Contract call returned empty data, using fallback:', err.message)
      return fallback
    }
    throw err
  }
}

const formatAddress = (address: string): string => {
  try {
    return ethers.getAddress(address)
  } catch {
    throw new Error(`Invalid address: ${address}`)
  }
}

const formatBigNumber = (value: any, decimals: number = 18): string => {
  try {
    if (!value) return '0'
    return ethers.formatUnits(value.toString(), decimals)
  } catch {
    return '0'
  }
}

const parseBigNumber = (value: string, decimals: number = 18): bigint => {
  try {
    const cleanValue = value.trim().replace(/,/g, '')
    if (!/^\d+(\.\d+)?$/.test(cleanValue)) {
      throw new Error('Invalid number format')
    }
    return ethers.parseUnits(cleanValue, decimals)
  } catch (err) {
    throw new Error(`Failed to parse number: ${value}`)
  }
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

  // Validate contract addresses and network
const validateContracts = useCallback(async () => {
  console.log("🔍 Starting contract validation...")
  
  if (!blockchainService.isConnected()) {
    console.log("❌ Blockchain service not connected")
    return false
  }

  try {
    const provider = walletService.getWeb3Provider()
    if (!provider) throw new Error('No provider available')
    
    // Check what network we're actually on
    const network = await provider.getNetwork()
    console.log("🌐 Connected to network:", {
      chainId: network.chainId.toString(),
      name: network.name,
      expectedChainId: "11155111"
    })
    
    // Verify we're on Sepolia
    if (network.chainId !== 11155111n) {
      throw new Error(`Wrong network! Expected Sepolia (11155111), got ${network.chainId}`)
    }

    const quantumContract = await blockchainService.getContract('QuantumToken')
    const entanglementContract = await blockchainService.getContract('QuantumEntanglementContract')

    if (!quantumContract || !entanglementContract) {
      console.log("❌ Failed to get contract instances")
      throw new Error('Contracts not available')
    }

    // ✅ Fixed: Use .target instead of .getAddress()
    const quantumAddress = quantumContract.target
    const entanglementAddress = entanglementContract.target

    console.log("📋 Contract addresses:")
    console.log("QuantumToken:", quantumAddress)
    console.log("EntanglementContract:", entanglementAddress)
    console.log("Expected from env:", import.meta.env.VITE_QUANTUM_TOKEN_ADDRESS)
    
    // Check bytecode manually with better error handling
    console.log("🔍 Checking contract bytecode...")
    try {
      const quantumCode = await provider.getCode(quantumAddress)
      const entanglementCode = await provider.getCode(entanglementAddress)
      
      console.log("QuantumToken bytecode length:", quantumCode.length)
      console.log("EntanglementContract bytecode length:", entanglementCode.length)
      
      if (quantumCode === '0x') {
        throw new Error(`QuantumToken has no bytecode at ${quantumAddress}`)
      }
      if (entanglementCode === '0x') {
        throw new Error(`EntanglementContract has no bytecode at ${entanglementAddress}`)
      }
      
      console.log("✅ All contracts validated successfully")
      return true
      
    } catch (codeError) {
      console.error("Error checking bytecode:", codeError)
      throw codeError
    }
    
  } catch (error) {
    console.error("❌ Contract validation failed:", error)
    setState(prev => ({ ...prev, error: `Contract validation failed: ${error.message}` }))
    return false
  }
}, [])



  // Load user's quantum data from blockchain
const loadQuantumData = useCallback(async () => {
  if (!blockchainService.isConnected()) return

  setState(prev => ({ ...prev, isLoading: true, error: null }))

  try {
    // Validate contracts first
    const contractsValid = await validateContracts()
    if (!contractsValid) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    const account = blockchainService.getAccount()
    if (!account) throw new Error('No account connected')

    // ✅ Properly await contract instances
    const quantumContract = await blockchainService.getContract('QuantumToken')
    const entanglementContract = await blockchainService.getContract('QuantumEntanglementContract')

    if (!quantumContract || !entanglementContract) {
      throw new Error('Failed to connect to contracts')
    }

    // ... rest of your code
  } catch (error) {
    console.error('Failed to load quantum data:', error)
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: `Failed to load quantum data: ${error.message}`
    }))
  }
}, [validateContracts])


  // Generate quantum identity on blockchain
  const generateIdentity = useCallback(async (): Promise<boolean> => {
    if (!blockchainService.isConnected()) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
      return false
    }

    setState(prev => ({ ...prev, isGeneratingIdentity: true, error: null }))

    try {
      // Validate contracts first
      const contractsValid = await validateContracts()
      if (!contractsValid) {
        setState(prev => ({ ...prev, isGeneratingIdentity: false }))
        return false
      }

      const account = blockchainService.getAccount()
      const quantumContract = blockchainService.getContract('QuantumToken')

      if (!account || !quantumContract) {
        throw new Error('Failed to connect to contract')
      }

      const evmAddress = formatAddress(blockchainService.accountIdToAddress(account))

      // Check if identity already exists
      const existingIdentity = await safeCall(async () => {
        const identityData = await quantumContract.getQuantumIdentity(evmAddress)
        return identityData && identityData.isActive
      }, false)

      if (existingIdentity) {
        throw new Error('Quantum identity already exists for this address')
      }

      // Estimate gas before sending transaction
      const gasEstimate = await quantumContract.generateQuantumIdentity.estimateGas(evmAddress)
      const gasLimit = gasEstimate + (gasEstimate * 20n / 100n) // Add 20% buffer

      // Call smart contract to generate identity
      const tx = await quantumContract.generateQuantumIdentity(evmAddress, {
        gasLimit
      })
      console.log('Transaction sent:', tx.hash)

      // Wait for transaction confirmation
      const receipt = await tx.wait()
      if (receipt.status !== 1) {
        throw new Error('Transaction failed')
      }
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
        error: `Failed to generate identity: ${(error as Error).message}`
      }))
      return false
    }
  }, [validateContracts, loadQuantumData])

  // Create quantum entanglement
  const createEntanglement = useCallback(async (
    assetA: string, 
    assetB: string, 
    strength: number
  ): Promise<boolean> => {
    if (!blockchainService.isConnected()) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
      return false
    }

    try {
      // Validate inputs
      const addressA = formatAddress(assetA)
      const addressB = formatAddress(assetB)
      
      if (addressA === addressB) {
        throw new Error('Cannot entangle asset with itself')
      }
      
      const strengthInt = Math.floor(Math.max(0, Math.min(100, strength))) // Clamp 0-100

      // Validate contracts
      const contractsValid = await validateContracts()
      if (!contractsValid) return false

      const entanglementContract = blockchainService.getContract('QuantumEntanglementContract')
      if (!entanglementContract) throw new Error('Failed to connect to contract')

      // Estimate gas
      const gasEstimate = await entanglementContract.createEntanglement.estimateGas(
        addressA, 
        addressB, 
        strengthInt
      )
      const gasLimit = gasEstimate + (gasEstimate * 20n / 100n)

      // Create entanglement on blockchain
      const tx = await entanglementContract.createEntanglement(addressA, addressB, strengthInt, {
        gasLimit
      })
      console.log('Entanglement creation sent:', tx.hash)

      const receipt = await tx.wait()
      if (receipt.status !== 1) {
        throw new Error('Transaction failed')
      }
      console.log('Entanglement created!')

      // Reload data to show new entanglement
      await loadQuantumData()
      return true

    } catch (error) {
      console.error('Failed to create entanglement:', error)
      setState(prev => ({ 
        ...prev, 
        error: `Failed to create entanglement: ${(error as Error).message}` 
      }))
      return false
    }
  }, [validateContracts, loadQuantumData])

  // Sync entanglement
  const syncEntanglement = useCallback(async (entanglementId: string): Promise<boolean> => {
    if (!blockchainService.isConnected()) return false

    try {
      if (!entanglementId || entanglementId.trim() === '') {
        throw new Error('Invalid entanglement ID')
      }

      const contractsValid = await validateContracts()
      if (!contractsValid) return false

      const entanglementContract = blockchainService.getContract('QuantumEntanglementContract')
      if (!entanglementContract) throw new Error('Failed to connect to contract')

      // Estimate gas
      const gasEstimate = await entanglementContract.syncEntanglement.estimateGas(entanglementId)
      const gasLimit = gasEstimate + (gasEstimate * 20n / 100n)

      const tx = await entanglementContract.syncEntanglement(entanglementId, {
        gasLimit
      })

      const receipt = await tx.wait()
      if (receipt.status !== 1) {
        throw new Error('Transaction failed')
      }

      // Reload data to show updated sync time
      await loadQuantumData()
      return true

    } catch (error) {
      console.error('Failed to sync entanglement:', error)
      setState(prev => ({ 
        ...prev, 
        error: `Failed to sync entanglement: ${(error as Error).message}` 
      }))
      return false
    }
  }, [validateContracts, loadQuantumData])

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
