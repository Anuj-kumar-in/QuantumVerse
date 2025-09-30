import React, { useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { useWallet } from '../../hooks/useWallet'
import { WalletProvider } from '../../types/hedera'
import Button from '../common/Button'
import Card from '../common/Card'
import Loader from '../common/Loader'

interface WalletOption {
  provider: WalletProvider
  name: string
  icon: string
  description: string
  supported: boolean
  comingSoon?: boolean
}

export const WalletConnect: React.FC = () => {
  const { connect, isConnecting, connectionState } = useWallet()
  const [selectedProvider, setSelectedProvider] = useState<WalletProvider | null>(null)

  const walletOptions: WalletOption[] = [
    {
      provider: WalletProvider.HASHPACK,
      name: 'HashPack',
      icon: '🔷',
      description: 'The native Hedera wallet with quantum security features',
      supported: true
    },
    {
      provider: WalletProvider.BLADE,
      name: 'Blade Wallet',
      icon: '⚔️',
      description: 'Multi-chain wallet with DeFi integration',
      supported: true
    },
    {
      provider: WalletProvider.KABILA,
      name: 'Kabila',
      icon: '🦎',
      description: 'Mobile-first Hedera wallet',
      supported: true,
      comingSoon: true
    },
    {
      provider: WalletProvider.METAMASK,
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect via Hedera EVM compatibility layer',
      supported: true
    },
    {
      provider: WalletProvider.WALLETCONNECT,
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect any WalletConnect compatible wallet',
      supported: false,
      comingSoon: true
    }
  ]

  const handleConnect = async (provider: WalletProvider) => {
    setSelectedProvider(provider)
    try {
      await connect(provider)
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setSelectedProvider(null)
    }
  }

  if (connectionState.isConnected) {
    return (
      <Card variant="quantum" className="text-center">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            Wallet Connected!
          </h3>
          <p className="text-gray-400">
            Connected to {connectionState.provider} wallet
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Account ID:</span>
            <span className="font-mono">{connectionState.account?.accountId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Network:</span>
            <span className="text-quantum-400">{connectionState.network}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Balance:</span>
            <span className="font-mono">{connectionState.account?.balance} ℏ</span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-quantum mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-400">
          Choose a wallet to enter the QuantumVerse
        </p>
      </div>

      <div className="grid gap-4">
        {walletOptions.map((option) => (
          <motion.div
            key={option.provider}
            whileHover={{ scale: option.supported ? 1.02 : 1 }}
            whileTap={{ scale: option.supported ? 0.98 : 1 }}
          >
            <Card
              variant="default"
              className={clsx(
                'cursor-pointer transition-all duration-300',
                option.supported 
                  ? 'hover:border-quantum-400/50' 
                  : 'opacity-60 cursor-not-allowed'
              )}
              onClick={option.supported ? () => handleConnect(option.provider) : undefined}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-2xl">
                  {isConnecting && selectedProvider === option.provider ? (
                    <Loader size="sm" variant="quantum" />
                  ) : (
                    option.icon
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{option.name}</h3>
                    {option.comingSoon && (
                      <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{option.description}</p>
                </div>

                {option.supported && (
                  <div className="text-quantum-400">→</div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <h4 className="font-semibold text-blue-300 mb-2">🔐 Quantum Security</h4>
        <p className="text-sm text-blue-200">
          All wallet connections are secured with quantum-resistant cryptography,
          ensuring your assets remain safe in the post-quantum era.
        </p>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>New to Hedera? <span className="text-quantum-400 cursor-pointer hover:underline">Get a wallet →</span></p>
      </div>
    </div>
  )
}

export default WalletConnect