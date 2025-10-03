import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { blockchainService } from '../services/ethereum/blockchain'
import { walletService } from '../services/ethereum/wallet'

export interface CarbonAction {
  id: number
  user: string
  actionType: string
  carbonSaved: number
  rewardAmount: number
  description: string
  isVerified: boolean
  timestamp: number
  proof?: string
}

export interface CarbonMetrics {
  totalOffset: number
  totalRewards: number
  actionsCount: number
  treesPlanted: number
  renewableHours: number
  rank: number
  monthlyGoal: number
  monthlyProgress: number
}

export interface CarbonState {
  isLoading: boolean
  error: string | null
  metrics: CarbonMetrics | null
  actions: CarbonAction[]
  tokenBalance: string
  isSubmitting: boolean
}

export const useCarbon = () => {
  const [state, setState] = useState<CarbonState>({
    isLoading: false,
    error: null,
    metrics: null,
    actions: [],
    tokenBalance: '0',
    isSubmitting: false
  })

  // Load carbon data from blockchain
  const loadCarbonData = useCallback(async () => {
    if (!blockchainService.isConnected()) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const accountId = blockchainService.getAccount()
      if (!accountId) throw new Error('No account connected')

      // Convert Hedera account ID to EVM address

      const account = blockchainService.accountIdToAddress(accountId)
      console.log(account,"hii")

      // Get contracts
      const carbonContract = blockchainService.getContract('CarbonRewardsContract')
      const carbonTokenContract = blockchainService.getContract('CarbonToken')
      console.log(carbonContract,carbonTokenContract)

      if (!carbonContract || !carbonTokenContract) {
        throw new Error('Failed to connect to carbon contracts')
      }

      // Load CARBON token balance
            console.log(account)
      const balance = await carbonTokenContract.balanceOf(account)
      console.log(balance)
      const formattedBalance = ethers.formatUnits(balance, 8)

      // Load user metrics from contract
      const metricsData = await carbonContract.getUserMetrics(account)
      const metrics: CarbonMetrics = {
        totalOffset: metricsData.totalOffset.toNumber() / 1000, // Convert grams to kg
        totalRewards: metricsData.totalRewards.toNumber() / 100000000, // Convert from wei-like format
        actionsCount: metricsData.actionsCount.toNumber(),

        // Computed metrics (in practice, these could be stored on-chain or computed from actions)
        treesPlanted: Math.floor(metricsData.totalOffset.toNumber() / 22000), // Assume 22kg CO2 per tree
        renewableHours: Math.floor(metricsData.totalOffset.toNumber() / 500), // Assume 500g CO2 per kWh
        rank: Math.max(1, 1000 - metricsData.totalRewards.toNumber()), // Mock ranking
        monthlyGoal: 5000, // 5kg CO2 goal
        monthlyProgress: Math.min(metricsData.totalOffset.toNumber() / 1000 / 5000, 1) // Progress towards 5kg goal
      }

      // Load user's carbon actions
      const userActionIds = await carbonContract.getUserActions(account)
      const actions: CarbonAction[] = []

      for (const actionId of userActionIds.slice(-10)) { // Get last 10 actions
        try {
          const actionData = await carbonContract.getAction(actionId)

          actions.push({
            id: actionId.toNumber(),
            user: actionData.user,
            actionType: actionData.actionType,
            carbonSaved: actionData.carbonSaved.toNumber(),
            rewardAmount: actionData.rewardAmount.toNumber() / 100000000, // Convert from wei-like
            description: actionData.description,
            isVerified: actionData.isVerified,
            timestamp: actionData.timestamp.toNumber() * 1000, // Convert to JS timestamp
            proof: '' // In practice, this could be an IPFS hash or URL
          })
        } catch (error) {
          console.warn(`Failed to load action ${actionId}:`, error)
        }
      }

      // Sort actions by timestamp (newest first)
      actions.sort((a, b) => b.timestamp - a.timestamp)

      setState(prev => ({
        ...prev,
        isLoading: false,
        metrics,
        actions,
        tokenBalance: formattedBalance
      }))

    } catch (error) {
      console.error('Failed to load carbon data:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message
      }))
    }
  }, [])

  // Submit carbon action to blockchain
  const submitAction = useCallback(async (actionData: {
    type: string
    carbonSaved: number
    description: string
    proof?: string
  }): Promise<boolean> => {
    if (!blockchainService.isConnected()) {
      setState(prev => ({ ...prev, error: 'Please connect your wallet first' }))
      return false
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }))

    try {
      const carbonContract = blockchainService.getContract('CarbonRewardsContract')
      if (!carbonContract) throw new Error('Failed to connect to carbon contract')

      // Submit action to blockchain
      const tx = await carbonContract.submitAction(
        actionData.type,
        actionData.carbonSaved,
        actionData.description,
        actionData.proof || ''
      )
      console.log('Carbon action submitted:', tx.hash)

      await blockchainService.waitForTransaction(tx.hash)
      console.log('Carbon action confirmed!')

      // Reload data to show new action
      await loadCarbonData()

      setState(prev => ({ ...prev, isSubmitting: false }))
      return true

    } catch (error) {
      console.error('Failed to submit carbon action:', error)
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: (error as Error).message
      }))
      return false
    }
  }, [loadCarbonData])

  // Get global carbon statistics (mock for now)
  const getGlobalStats = useCallback(() => {
    return {
      totalOffset: 12543.2,
      totalTrees: 47821,
      activeUsers: 15234,
      countriesInvolved: 89
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Load data when wallet connects/changes
  useEffect(() => {
    const connectedAccount = walletService.getConnectedAccount()
    if (connectedAccount) {
      loadCarbonData()
      blockchainService.clearContracts()
    }
  }, [loadCarbonData])

  // Auto-refresh data every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (blockchainService.isConnected() && !state.isLoading) {
        loadCarbonData()
      }
    }, 120000)

    return () => clearInterval(interval)
  }, [loadCarbonData, state.isLoading])

  return {
    metrics: state.metrics,
    actions: state.actions,
    tokenBalance: state.tokenBalance,
    isLoading: state.isLoading,
    error: state.error,
    isSubmitting: state.isSubmitting,
    submitAction,
    loadCarbonData,
    getGlobalStats,
    clearError
  }
}

export default useCarbon