import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePhysics } from '../hooks/usePhysics'
import { useAccount } from '../hooks/useHedera'
import PhysicsMarketplace from '../components/physics/PhysicsMarketplace'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'

export const Marketplace: React.FC = () => {
  const { state, loadMarketplace } = usePhysics()
  const account = useAccount()
  const [activeTab, setActiveTab] = useState('physics')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeMarketplace = async () => {
      setIsLoading(true)
      try {
        await loadMarketplace()
      } catch (error) {
        console.error('Failed to load marketplace:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (account) {
      initializeMarketplace()
    } else {
      setIsLoading(false)
    }
  }, [loadMarketplace, account])

  // Calculate dynamic stats
  const stats = {
    physicsNFTs: state.nfts.length,
    userNFTs: state.userNFTs.length,
    totalValue: state.nfts.reduce((sum, nft) => sum + parseFloat(nft.price || '0'), 0),
    activeTraders: Math.floor(state.nfts.length * 1.2) + 847, // Mock calculation
    co2Offset: (state.nfts.length * 0.05 + 12.3).toFixed(1)
  }

  const tabs = [
    { 
      id: 'physics', 
      label: 'Physics NFTs', 
      icon: '⚡', 
      count: stats.physicsNFTs,
      variant: 'physics' as const
    },
    { 
      id: 'quantum', 
      label: 'Quantum Assets', 
      icon: '⚛️', 
      count: 0,
      variant: 'quantum' as const,
      comingSoon: true
    },
    { 
      id: 'ai', 
      label: 'AI Entities', 
      icon: '🤖', 
      count: 0,
      variant: 'ai' as const,
      comingSoon: true
    },
    { 
      id: 'carbon', 
      label: 'Carbon Credits', 
      icon: '🌱', 
      count: 0,
      variant: 'carbon' as const,
      comingSoon: true
    }
  ]

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const handleStartTrading = () => {
    if (!account) {
      // Could trigger wallet connection modal here
      console.log('Please connect wallet first')
      return
    }
    setActiveTab('physics')
  }

  const handleBrowseCollections = () => {
    setActiveTab('physics')
    // Could scroll to marketplace section
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-400">Loading QuantumVerse Marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card variant="quantum" gradient className="relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="w-full h-full bg-gradient-to-br from-physics-500 via-quantum-500 to-ai-500"
            style={{
              backgroundSize: '400% 400%',
            }}
          />
        </div>

        <div className="relative z-10 text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold font-quantum mb-6">
              QuantumVerse{' '}
              <span className="bg-gradient-to-r from-physics-400 to-quantum-400 bg-clip-text text-transparent">
                Marketplace
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Trade physics properties, quantum assets, AI entities, and carbon credits 
              in the world's first multi-reality marketplace powered by Hedera
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="physics" 
                size="lg" 
                quantum 
                glow
                onClick={handleStartTrading}
                disabled={!account && stats.physicsNFTs === 0}
              >
                {account ? 'Start Trading' : 'Connect Wallet to Trade'}
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={handleBrowseCollections}
              >
                Browse Collections
              </Button>
            </div>

            {!account && (
              <p className="mt-4 text-sm text-gray-400">
                Connect your Hedera wallet to start trading physics properties
              </p>
            )}
          </motion.div>
        </div>
      </Card>

      {/* Marketplace Stats */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card variant="physics" className="text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-physics-400">
              {stats.physicsNFTs}
            </div>
            <div className="text-sm text-gray-400">Physics NFTs</div>
            {stats.userNFTs > 0 && (
              <div className="text-xs text-physics-300 mt-1">
                ({stats.userNFTs} owned)
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card variant="quantum" className="text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-quantum-400">
              {stats.totalValue.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">HBAR Volume</div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card variant="ai" className="text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-ai-400">
              {stats.activeTraders}
            </div>
            <div className="text-sm text-gray-400">Active Traders</div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card variant="carbon" className="text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🌱</div>
            <div className="text-2xl font-bold text-carbon-400">
              {stats.co2Offset}
            </div>
            <div className="text-sm text-gray-400">Tons CO₂ Offset</div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Navigation Tabs */}
      <Card variant="default">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={activeTab === tab.id ? tab.variant : 'secondary'}
                size="sm"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 relative ${
                  tab.comingSoon ? 'opacity-75' : ''
                }`}
                disabled={tab.comingSoon && tab.count === 0}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {tab.count}
                </span>
                {tab.comingSoon && tab.count === 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-quantum-400 to-physics-400 text-white text-xs px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Marketplace Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          {activeTab === 'physics' && <PhysicsMarketplace />}

          {activeTab === 'quantum' && (
            <Card variant="quantum" className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="text-6xl mb-4">⚛️</div>
                <h3 className="text-xl font-semibold mb-2">Quantum Assets Coming Soon</h3>
                <p className="text-gray-400 mb-6">
                  Quantum-entangled assets and identity fragments will be available for trading soon.
                  Experience true quantum ownership on Hedera.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="quantum" disabled>
                    Notify Me
                  </Button>
                  <Button variant="secondary" onClick={() => setActiveTab('physics')}>
                    Explore Physics NFTs
                  </Button>
                </div>
              </motion.div>
            </Card>
          )}

          {activeTab === 'ai' && (
            <Card variant="ai" className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2">AI Entity Trading Coming Soon</h3>
                <p className="text-gray-400 mb-6">
                  Buy, sell, and trade autonomous AI entities with their skills, reputation,
                  and learned behaviors on the Hedera network.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="ai" disabled>
                    Join Waitlist
                  </Button>
                  <Button variant="secondary" onClick={() => setActiveTab('physics')}>
                    Browse Current Assets
                  </Button>
                </div>
              </motion.div>
            </Card>
          )}

          {activeTab === 'carbon' && (
            <Card variant="carbon" className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-xl font-semibold mb-2">Carbon Credit Marketplace Coming Soon</h3>
                <p className="text-gray-400 mb-6">
                  Trade verified carbon credits and environmental impact certificates.
                  Make a real-world impact while earning rewards.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="carbon" disabled>
                    Pre-Register
                  </Button>
                  <Button variant="secondary" onClick={() => setActiveTab('physics')}>
                    Start with Physics
                  </Button>
                </div>
              </motion.div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Additional Features Coming Soon Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Card variant="default" className="bg-gradient-to-r from-physics-900/20 to-quantum-900/20 border-physics-500/30">
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold mb-2">🚀 More Features Coming Soon</h3>
            <p className="text-gray-400 text-sm">
              Cross-chain trading • NFT staking • Physics combinations • Governance voting
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default Marketplace
