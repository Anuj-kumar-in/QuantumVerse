import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuantum } from '../hooks/useQuantum'
import { useAccount } from '../hooks/useHedera'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import QuantumParticles from '../components/quantum/QuantumParticles'

const RealityType = {
  VIRTUAL: 'Virtual',
  AUGMENTED: 'Augmented',
  PHYSICAL: 'Physical',
  MIXED: 'Mixed'
} as const

type RealityType = typeof RealityType[keyof typeof RealityType]

interface RealityPortal {
  id: string
  name: string
  type: RealityType
  description: string
  isActive: boolean
  connectedUsers: number
  features: string[]
  icon: string
  gradient: string
}

export const Portal: React.FC = () => {
  const { state } = useQuantum()
  const account = useAccount()
  const [currentReality, setCurrentReality] = useState<RealityType>(RealityType.VIRTUAL)
  const [selectedPortal, setSelectedPortal] = useState<RealityPortal | null>(null)
  const [showTransitionModal, setShowTransitionModal] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const portals: RealityPortal[] = [
    {
      id: 'virtual-metaverse',
      name: 'QuantumVerse Metaverse',
      type: RealityType.VIRTUAL,
      description: 'Immersive virtual worlds with full physics simulation',
      isActive: true,
      connectedUsers: 2847,
      features: ['Full-body avatars', 'Physics manipulation', 'AI companions', 'Virtual economies'],
      icon: '🌐',
      gradient: 'from-purple-500 to-blue-500'
    },
    {
      id: 'ar-overlay',
      name: 'Reality Augmentation',
      type: RealityType.AUGMENTED,
      description: 'Overlay digital assets onto the physical world',
      isActive: true,
      connectedUsers: 1523,
      features: ['Spatial anchoring', 'Object recognition', 'Gesture control', 'Social AR'],
      icon: '👓',
      gradient: 'from-cyan-500 to-teal-500'
    },
    {
      id: 'physical-integration',
      name: 'Physical Integration',
      type: RealityType.PHYSICAL,
      description: 'Connect IoT devices and real-world sensors',
      isActive: true,
      connectedUsers: 894,
      features: ['IoT connectivity', 'Sensor fusion', 'Real-world physics', 'Smart contracts'],
      icon: '🏠',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'mixed-reality',
      name: 'Quantum Mixed Reality',
      type: RealityType.MIXED,
      description: 'Seamlessly blend all reality types with quantum entanglement',
      isActive: true,
      connectedUsers: 567,
      features: ['Reality bridging', 'Quantum sync', 'Cross-platform', 'Unified experience'],
      icon: '🌌',
      gradient: 'from-pink-500 to-purple-500'
    }
  ]

  const handlePortalTransition = async (portal: RealityPortal) => {
    setSelectedPortal(portal)
    setShowTransitionModal(true)
  }

  const executeTransition = async () => {
    if (!selectedPortal) return

    setIsTransitioning(true)

    // Simulate quantum transition
    await new Promise(resolve => setTimeout(resolve, 3000))

    setCurrentReality(selectedPortal.type)
    setIsTransitioning(false)
    setShowTransitionModal(false)
    setSelectedPortal(null)
  }

  const getRealityColor = (reality: RealityType) => {
    switch (reality) {
      case RealityType.VIRTUAL: return 'text-purple-400'
      case RealityType.AUGMENTED: return 'text-cyan-400'
      case RealityType.PHYSICAL: return 'text-green-400'
      case RealityType.MIXED: return 'text-pink-400'
      default: return 'text-gray-400'
    }
  }

  const getCurrentPortal = () => {
    return portals.find(p => p.type === currentReality)
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card variant="quantum" gradient className="relative overflow-hidden">
        <QuantumParticles count={60} color="quantum" />

        <div className="relative z-10 text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold font-quantum mb-6">
              Reality{' '}
              <span className="bg-gradient-to-r from-quantum-400 to-physics-400 bg-clip-text text-transparent">
                Portal
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Travel between virtual, augmented, physical, and mixed realities. 
              Your assets and identity remain synchronized across all dimensions 
              through quantum entanglement technology.
            </p>

            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-gray-400">Current Reality:</span>
              <span className={`text-2xl font-bold ${getRealityColor(currentReality)}`}>
                {getCurrentPortal()?.icon} {currentReality}
              </span>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* Reality Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card variant="quantum" className="text-center">
          <div className="text-3xl mb-2">🌐</div>
          <div className="text-2xl font-bold text-quantum-400">
            {portals.filter(p => p.isActive).length}
          </div>
          <div className="text-sm text-gray-400">Active Portals</div>
        </Card>

        <Card variant="physics" className="text-center">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-physics-400">
            {portals.reduce((sum, p) => sum + p.connectedUsers, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Connected Users</div>
        </Card>

        <Card variant="ai" className="text-center">
          <div className="text-3xl mb-2">🔄</div>
          <div className="text-2xl font-bold text-ai-400">
            {state.entanglements.length}
          </div>
          <div className="text-sm text-gray-400">Entanglements</div>
        </Card>

        <Card variant="carbon" className="text-center">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-carbon-400">99.9%</div>
          <div className="text-sm text-gray-400">Sync Reliability</div>
        </Card>
      </div>

      {/* Portal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {portals.map((portal) => (
          <motion.div
            key={portal.id}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              variant="default" 
              className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
                currentReality === portal.type ? 'ring-2 ring-quantum-400' : ''
              }`}
              onClick={() => handlePortalTransition(portal)}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${portal.gradient} opacity-10`} />

              {/* Current Reality Indicator */}
              {currentReality === portal.type && (
                <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              )}

              <div className="relative z-10 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{portal.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{portal.name}</h3>
                    <p className={`font-semibold ${getRealityColor(portal.type)}`}>
                      {portal.type} Reality
                    </p>
                  </div>
                </div>

                <p className="text-gray-400 mb-6">{portal.description}</p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Connected Users:</span>
                    <span className="font-semibold">{portal.connectedUsers.toLocaleString()}</span>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {portal.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-700 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <Button
                      variant={currentReality === portal.type ? 'secondary' : 'quantum'}
                      className="w-full"
                      disabled={currentReality === portal.type}
                    >
                      {currentReality === portal.type ? 'Current Reality' : 'Enter Portal'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Reality Comparison */}
      <Card variant="default">
        <h3 className="text-xl font-semibold mb-6">Reality Comparison</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4">Feature</th>
                <th className="text-center p-4">
                  <div className="text-purple-400">🌐 Virtual</div>
                </th>
                <th className="text-center p-4">
                  <div className="text-cyan-400">👓 Augmented</div>
                </th>
                <th className="text-center p-4">
                  <div className="text-green-400">🏠 Physical</div>
                </th>
                <th className="text-center p-4">
                  <div className="text-pink-400">🌌 Mixed</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Immersion Level', 'Complete', 'Partial', 'Contextual', 'Dynamic'],
                ['Physics Manipulation', '✅ Full', '✅ Limited', '✅ Sensors Only', '✅ Complete'],
                ['Social Features', '✅ Avatar-based', '✅ Shared Space', '✅ IoT Connected', '✅ All Types'],
                ['Asset Persistence', '✅ Virtual Only', '✅ Spatial Anchors', '✅ Physical Items', '✅ Cross-Reality'],
                ['Device Requirements', 'VR Headset', 'AR Glasses/Phone', 'IoT Sensors', 'All Devices'],
                ['Bandwidth Usage', 'High', 'Medium', 'Low', 'Variable']
              ].map(([feature, virtual, augmented, physical, mixed], index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="p-4 font-medium">{feature}</td>
                  <td className="p-4 text-center text-sm">{virtual}</td>
                  <td className="p-4 text-center text-sm">{augmented}</td>
                  <td className="p-4 text-center text-sm">{physical}</td>
                  <td className="p-4 text-center text-sm">{mixed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cross-Reality Assets */}
      <Card variant="quantum">
        <h3 className="text-xl font-semibold mb-6">Cross-Reality Asset Status</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold">🎮 Game Assets</h4>
            <div className="space-y-2">
              {[
                { name: 'Avatar "QuantumWarrior"', status: 'Synced', realities: ['Virtual', 'Mixed'] },
                { name: 'Gravity Sword NFT', status: 'Synced', realities: ['Virtual', 'Augmented', 'Mixed'] },
                { name: 'AI Companion "Zara"', status: 'Active', realities: ['All'] }
              ].map((asset, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-quantum-900/20 rounded-lg">
                  <div>
                    <h5 className="font-medium">{asset.name}</h5>
                    <p className="text-sm text-gray-400">
                      Active in: {asset.realities.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-green-400">{asset.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">🌐 Reality Anchors</h4>
            <div className="space-y-2">
              {[
                { name: 'Home Base Portal', location: 'Living Room', type: 'Physical → Virtual' },
                { name: 'Office AR Workspace', location: 'Desk Setup', type: 'Physical → Augmented' },
                { name: 'Mixed Reality Hub', location: 'Game Room', type: 'All Realities' }
              ].map((anchor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-physics-900/20 rounded-lg">
                  <div>
                    <h5 className="font-medium">{anchor.name}</h5>
                    <p className="text-sm text-gray-400">
                      {anchor.location} • {anchor.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-green-400">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Portal Transition Modal */}
      <Modal
        isOpen={showTransitionModal}
        onClose={() => !isTransitioning && setShowTransitionModal(false)}
        title="Portal Transition"
        variant="quantum"
        size="lg"
      >
        {selectedPortal && (
          <div className="space-y-6">
            {!isTransitioning ? (
              <>
                <div className="text-center">
                  <div className="text-6xl mb-4">{selectedPortal.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{selectedPortal.name}</h3>
                  <p className={`font-semibold mb-4 ${getRealityColor(selectedPortal.type)}`}>
                    {selectedPortal.type} Reality
                  </p>
                  <p className="text-gray-400">{selectedPortal.description}</p>
                </div>

                <div className="p-4 bg-quantum-900/20 border border-quantum-500/30 rounded-lg">
                  <h4 className="font-semibold text-quantum-300 mb-3">🔄 Transition Process</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Synchronizing quantum states across realities</li>
                    <li>• Preserving asset integrity and ownership</li>
                    <li>• Establishing secure connection protocols</li>
                    <li>• Activating reality-specific features</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="quantum"
                    onClick={executeTransition}
                    className="flex-1"
                    glow
                  >
                    Begin Transition
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowTransitionModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto border-4 border-quantum-400 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">
                    {selectedPortal.icon}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">Transitioning to {selectedPortal.type} Reality</h3>
                <p className="text-gray-400 mb-6">
                  Quantum entanglement in progress... Your assets are being synchronized.
                </p>

                <div className="space-y-2">
                  <div className="text-sm text-quantum-400">Synchronizing quantum states...</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div 
                      className="bg-quantum-400 h-2 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Portal