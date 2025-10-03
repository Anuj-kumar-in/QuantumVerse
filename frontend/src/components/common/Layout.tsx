import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navigation from './Navigation'
import clsx from 'clsx'
import { useWallet } from '../../hooks/useWallet'
import { useHedera } from '../../hooks/useHedera'
import { WalletProvider } from '../../types/ethereum'
import Button from './Button'
import Modal from './Modal'
import Loader from './Loader'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const { isConnected, connect, disconnect, isConnecting } = useWallet()
  const { state } = useHedera()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleWalletConnect = async (provider: string) => {
    let walletProvider: WalletProvider | null = null

    switch (provider.toUpperCase()) {
      case 'METAMASK':
        walletProvider = WalletProvider.METAMASK
        break
      default:
        console.error(`Unsupported wallet provider: ${provider}`)
        return
    }

    if (walletProvider) {
      await connect(walletProvider)
      setShowWalletModal(false)
    }
  }

  if (!state.isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Loader
          variant="quantum"
          size="xl"
          text="Initializing QuantumVerse..."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-quantum-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-physics-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-carbon-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Navigation />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowMobileMenu(true)}
              >
                ☰
              </Button>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-quantum-500 to-physics-500 flex items-center justify-center">
                  <span className="text-sm">⚛️</span>
                </div>
                <h1 className="text-lg font-bold font-quantum">QuantumVerse</h1>
              </div>
            </div>

            {!isConnected ? (
              <Button
                variant="quantum"
                size="sm"
                onClick={() => setShowWalletModal(true)}
                loading={isConnecting}
              >
                Connect Wallet
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={disconnect}
              >
                Disconnect
              </Button>
            )}
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className={clsx(
        'transition-all duration-300',
        'md:ml-64',
        'pt-20 md:pt-0'
      )}>
        <div className="relative z-10">
          {/* Top Bar */}
          <div className="hidden md:flex items-center justify-between p-6 border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">Hedera Testnet</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-quantum-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">Quantum Secure</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {!isConnected ? (
                <Button
                  variant="quantum"
                  onClick={() => setShowWalletModal(true)}
                  loading={isConnecting}
                  quantum
                >
                  Connect Wallet
                </Button>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Connected</p>
                    <p className="text-sm font-mono">
                      {state.wallet.account?.accountId}
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={disconnect}
                  >
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Page Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Menu Modal */}
      <Modal
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        title="Navigation"
        size="sm"
      >
        <div className="space-y-2">
          {/* Mobile navigation items would go here */}
          <p className="text-gray-400">Mobile navigation menu</p>
        </div>
      </Modal>

      {/* Wallet Connection Modal */}
      <Modal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        title="Connect Wallet"
        variant="quantum"
      >
        <div className="space-y-4">
          <p className="text-gray-400 mb-6">
            Choose a wallet to connect to QuantumVerse
          </p>

          <div className="grid gap-3">
            <Button
              variant="quantum"
              className="justify-start"
              onClick={() => handleWalletConnect('HASHPACK')}
              loading={isConnecting}
            >
              <span className="text-2xl mr-3">🔷</span>
              HashPack Wallet
            </Button>

            <Button
              variant="secondary"
              className="justify-start"
              onClick={() => handleWalletConnect('BLADE')}
              loading={isConnecting}
            >
              <span className="text-2xl mr-3">⚔️</span>
              Blade Wallet
            </Button>

            <Button
              variant="secondary"
              className="justify-start"
              onClick={() => handleWalletConnect('KABILA')}
              loading={isConnecting}
            >
              <span className="text-2xl mr-3">🦎</span>
              Kabila Wallet
            </Button>

            <Button
              variant="secondary"
              className="justify-start"
              onClick={() => handleWalletConnect('METAMASK')}
              loading={isConnecting}
            >
              <span className="text-2xl mr-3">🦊</span>
              MetaMask (EVM)
            </Button>
          </div>

          <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-300">
              ⚠️ Make sure you're connected to Hedera Testnet for development
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Layout
