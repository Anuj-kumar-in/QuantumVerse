import { useContext } from 'react'
import { HederaContext } from '../contexts/Ethereum/HederaContext'

export function useHedera() {
  const context = useContext(HederaContext)
  if (!context) {
    throw new Error('useHedera must be used within a HederaProvider')
  }
  return context
}

export function useWallet() {
  const { state } = useHedera()
  return state.wallet
}

export function useAccount() {
  const { state } = useHedera()
  return state.wallet.account
}

export function useHederaConfig() {
  const { state } = useHedera()
  return state.config
}