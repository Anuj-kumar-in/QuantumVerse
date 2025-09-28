import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import QuantumParticles from '../components/quantum/QuantumParticles'

export const Home: React.FC = () => {
  const { isConnected } = useWallet()

  const features = [
    {
      title: 'Quantum Identity',
      description: 'Secure your digital identity with quantum-resistant cryptography',
      icon: '🔐',
      path: '/identity',
      color: 'quantum'
    },
    {
      title: 'Physics NFTs',
      description: 'Own and trade real-world physics properties as NFTs',
      icon: '⚡',
      path: '/marketplace',
      color: 'physics'
    },
    {
      title: 'AI Entities',
      description: 'Create autonomous AI entities that act independently',
      icon: '🤖',
      path: '/ai-entities',
      color: 'ai'
    },
    {
      title: 'Carbon Rewards',
      description: 'Earn rewards for sustainable and eco-friendly actions',
      icon: '🌱',
      path: '/carbon',
      color: 'carbon'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card variant="quantum" gradient className="relative overflow-hidden">
        <QuantumParticles count={30} color="quantum" />

        <div className="relative z-10 text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold font-quantum mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-quantum-400 to-physics-400 bg-clip-text text-transparent">
                QuantumVerse
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The world's first quantum-secured multi-reality gaming ecosystem. 
              Experience true ownership of digital assets across virtual, augmented, and physical realities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isConnected ? (
                <Link to="/dashboard">
                  <Button variant="quantum" size="lg" quantum glow>
                    Enter QuantumVerse
                  </Button>
                </Link>
              ) : (
                <Button variant="quantum" size="lg" quantum glow>
                  Connect Wallet to Start
                </Button>
              )}

              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={feature.path}>
              <Card
                variant={feature.color as any}
                hover
                className="h-full text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Technology Section */}
      <Card variant="default">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-quantum mb-6">
            Powered by Hedera Hashgraph
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">
                Sub-second finality with Hedera's consensus algorithm
              </p>
            </div>

            <div className="p-6">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Bank-Grade Security</h3>
              <p className="text-gray-400">
                aBFT consensus with quantum-resistant cryptography
              </p>
            </div>

            <div className="p-6">
              <div className="text-3xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold mb-2">Carbon Negative</h3>
              <p className="text-gray-400">
                Most energy-efficient public network with built-in carbon offsetting
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Home