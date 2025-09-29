import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePhysics } from '../hooks/usePhysics'
import { useAccount } from '../hooks/useHedera'
import PhysicsMarketplace from '../components/physics/PhysicsMarketplace'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

export const Marketplace: React.FC = () => {
  const { state, loadMarketplace } = usePhysics()
  const account = useAccount()
  const [activeTab, setActiveTab] = useState('physics')

  useEffect(() => {
    loadMarketplace()
  }, [loadMarketplace])

  const tabs = [
    { id: 'physics', label: 'Physics NFTs', icon: '⚡', count: state.nfts.length },
    { id: 'quantum', label: 'Quantum Assets', icon: '⚛️', count: 0 },
    { id: 'ai', label: 'AI Entities', icon: '🤖', count: 0 },
    { id: 'carbon', label: 'Carbon Credits', icon: '🌱', count: 0 }
  ]

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card variant="quantum" gradient className="relative overflow-hidden">
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
              in the world's first multi-reality marketplace
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="physics" size="lg" quantum glow>
                Start Trading
              </Button>
              <Button variant="secondary" size="lg">
                Browse Collections
              </Button>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* Marketplace Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card variant="physics" className="text-center">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-physics-400">{state.nfts.length}</div>
          <div className="text-sm text-gray-400">Physics NFTs</div>
        </Card>

        <Card variant="quantum" className="text-center">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-quantum-400">2.5k</div>
          <div className="text-sm text-gray-400">HBAR Volume</div>
        </Card>

        <Card variant="ai" className="text-center">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-ai-400">847</div>
          <div className="text-sm text-gray-400">Active Traders</div>
        </Card>

        <Card variant="carbon" className="text-center">
          <div className="text-3xl mb-2">🌱</div>
          <div className="text-2xl font-bold text-carbon-400">12.3</div>
          <div className="text-sm text-gray-400">Tons CO2 Offset</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Card variant="default">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'quantum' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
              <span className="bg-gray-600 text-white px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Marketplace Content */}
      <div className="min-h-screen">
        {activeTab === 'physics' && <PhysicsMarketplace />}

        {activeTab === 'quantum' && (
          <Card variant="quantum" className="text-center py-12">
            <div className="text-6xl mb-4">⚛️</div>
            <h3 className="text-xl font-semibold mb-2">Quantum Assets Coming Soon</h3>
            <p className="text-gray-400">
              Quantum-entangled assets and identity fragments will be available for trading soon
            </p>
          </Card>
        )}

        {activeTab === 'ai' && (
          <Card variant="ai" className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Entity Trading Coming Soon</h3>
            <p className="text-gray-400">
              Buy, sell, and trade autonomous AI entities with their skills and reputation
            </p>
          </Card>
        )}

        {activeTab === 'carbon' && (
          <Card variant="carbon" className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold mb-2">Carbon Credit Marketplace Coming Soon</h3>
            <p className="text-gray-400">
              Trade verified carbon credits and environmental impact certificates
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Marketplace