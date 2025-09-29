import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuantum } from '../hooks/useQuantum'
import { useAccount } from '../hooks/useHedera'
import EntanglementLab from '../components/quantum/EntanglementLab'
import QuantumParticles from '../components/quantum/QuantumParticles'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

export const Entanglement: React.FC = () => {
  const { state } = useQuantum()
  const account = useAccount()
  const [activeTab, setActiveTab] = useState('lab')

  const tabs = [
    { id: 'lab', label: 'Entanglement Lab', icon: '🔬' },
    { id: 'monitor', label: 'Monitor', icon: '📊' },
    { id: 'theory', label: 'Quantum Theory', icon: '📚' },
    { id: 'experiments', label: 'Experiments', icon: '⚗️' }
  ]

  const activeEntanglements = state.entanglements.filter(e => e.synchronizationStatus === 'SYNCHRONIZED')
  const totalStrength = activeEntanglements.reduce((sum, e) => sum + e.entanglementStrength, 0)

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card variant="quantum" gradient className="relative overflow-hidden">
        <QuantumParticles count={50} color="quantum" />

        <div className="relative z-10 text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold font-quantum mb-6">
              Quantum{' '}
              <span className="bg-gradient-to-r from-quantum-400 to-physics-400 bg-clip-text text-transparent">
                Entanglement
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Create quantum entanglements between assets across different realities.
              Experience true quantum correlation where actions on one asset instantly 
              affect its entangled pair across infinite distances.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="quantum" size="lg" quantum glow>
                Create Entanglement
              </Button>
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* Quantum Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card variant="quantum" className="text-center">
          <div className="text-3xl mb-2">🌌</div>
          <div className="text-2xl font-bold text-quantum-400">
            {activeEntanglements.length}
          </div>
          <div className="text-sm text-gray-400">Active Entanglements</div>
        </Card>

        <Card variant="physics" className="text-center">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-physics-400">
            {totalStrength.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">Total Strength</div>
        </Card>

        <Card variant="ai" className="text-center">
          <div className="text-3xl mb-2">🔄</div>
          <div className="text-2xl font-bold text-ai-400">
            {state.entanglements.filter(e =>
              Date.now() - e.lastSync.getTime() < 60000 // Synced in last minute
            ).length}
          </div>
          <div className="text-sm text-gray-400">Recent Syncs</div>
        </Card>

        <Card variant="carbon" className="text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-carbon-400">
            {Math.round(totalStrength / Math.max(activeEntanglements.length, 1))}%
          </div>
          <div className="text-sm text-gray-400">Avg Strength</div>
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
            </Button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      <div className="min-h-screen">
        {activeTab === 'lab' && <EntanglementLab />}

        {activeTab === 'monitor' && (
          <div className="space-y-6">
            <Card variant="quantum">
              <h3 className="text-xl font-semibold mb-6">Entanglement Monitor</h3>

              {activeEntanglements.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🌌</div>
                  <h4 className="text-lg font-semibold mb-2">No Active Entanglements</h4>
                  <p className="text-gray-400">
                    Create your first entanglement to start monitoring quantum correlations
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeEntanglements.map((entanglement) => (
                    <div 
                      key={entanglement.id}
                      className="p-4 bg-quantum-900/20 border border-quantum-500/30 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">
                          Entanglement #{entanglement.id.slice(-6)}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-400">Active</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Strength</p>
                          <div className="text-lg font-bold text-quantum-400">
                            {(entanglement.entanglementStrength * 100).toFixed(1)}%
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400">Last Sync</p>
                          <div className="text-lg font-bold text-physics-400">
                            {Math.floor((Date.now() - entanglement.lastSync.getTime()) / 1000)}s ago
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400">Reality Pair</p>
                          <div className="text-lg font-bold text-ai-400">
                            {entanglement.pairA.realityType} ↔ {entanglement.pairB.realityType}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button variant="quantum" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'theory' && (
          <Card variant="default">
            <h3 className="text-xl font-semibold mb-6">Quantum Entanglement Theory</h3>

            <div className="space-y-8">
              <div className="p-6 bg-quantum-900/20 border border-quantum-500/30 rounded-lg">
                <h4 className="font-semibold text-quantum-300 mb-4">🌌 What is Quantum Entanglement?</h4>
                <p className="text-gray-300 mb-4">
                  Quantum entanglement is a phenomenon where two particles become correlated 
                  in such a way that the quantum state of each particle cannot be described 
                  independently, even when separated by large distances.
                </p>
                <p className="text-gray-300">
                  In QuantumVerse, this principle is applied to digital assets, allowing 
                  for instant state synchronization across different realities and platforms.
                </p>
              </div>

              <div className="p-6 bg-physics-900/20 border border-physics-500/30 rounded-lg">
                <h4 className="font-semibold text-physics-300 mb-4">⚡ How It Works in QuantumVerse</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-physics-400 rounded-full flex items-center justify-center text-black font-bold text-sm">1</div>
                    <div>
                      <h5 className="font-semibold">Asset Pairing</h5>
                      <p className="text-gray-300">Two assets are quantum entangled using cryptographic protocols</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-physics-400 rounded-full flex items-center justify-center text-black font-bold text-sm">2</div>
                    <div>
                      <h5 className="font-semibold">State Correlation</h5>
                      <p className="text-gray-300">Changes to one asset automatically affect the entangled partner</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-physics-400 rounded-full flex items-center justify-center text-black font-bold text-sm">3</div>
                    <div>
                      <h5 className="font-semibold">Reality Bridging</h5>
                      <p className="text-gray-300">Entangled assets can exist in different realities while staying synchronized</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-ai-900/20 border border-ai-500/30 rounded-lg">
                <h4 className="font-semibold text-ai-300 mb-4">🎮 Gaming Applications</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• <strong>Cross-Reality Characters:</strong> Your avatar exists simultaneously in VR and AR</li>
                  <li>• <strong>Shared Inventories:</strong> Items collected in one game appear in another</li>
                  <li>• <strong>Synchronized Stats:</strong> Character progression syncs across all platforms</li>
                  <li>• <strong>Real-Time Collaboration:</strong> Players in different realities can interact</li>
                  <li>• <strong>Persistent Worlds:</strong> Changes in one reality affect all entangled worlds</li>
                </ul>
              </div>

              <div className="p-6 bg-carbon-900/20 border border-carbon-500/30 rounded-lg">
                <h4 className="font-semibold text-carbon-300 mb-4">🔒 Security & Privacy</h4>
                <p className="text-gray-300 mb-4">
                  Quantum entanglement in QuantumVerse uses advanced cryptographic techniques 
                  to ensure that entangled states cannot be intercepted or manipulated by 
                  unauthorized parties.
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li>• End-to-end encryption of quantum states</li>
                  <li>• Tamper-evident synchronization protocols</li>
                  <li>• User-controlled entanglement permissions</li>
                  <li>• Quantum-resistant security algorithms</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'experiments' && (
          <Card variant="default">
            <h3 className="text-xl font-semibold mb-6">Quantum Experiments</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="quantum">
                <h4 className="font-semibold mb-4">🧪 Bell's Inequality Test</h4>
                <p className="text-gray-400 mb-4">
                  Test the quantum nature of your entangled assets by measuring 
                  correlation violations of Bell's inequality.
                </p>
                <Button variant="quantum" className="w-full">
                  Run Experiment
                </Button>
              </Card>

              <Card variant="physics">
                <h4 className="font-semibold mb-4">📏 Quantum Teleportation</h4>
                <p className="text-gray-400 mb-4">
                  Transfer the quantum state of one asset to another through 
                  entanglement and classical communication.
                </p>
                <Button variant="physics" className="w-full">
                  Start Teleportation
                </Button>
              </Card>

              <Card variant="ai">  
                <h4 className="font-semibold mb-4">🎲 Quantum Random Walk</h4>
                <p className="text-gray-400 mb-4">
                  Observe how entangled particles move through quantum 
                  superposition states in a random walk experiment.
                </p>
                <Button variant="ai" className="w-full">
                  Begin Walk
                </Button>
              </Card>

              <Card variant="carbon">
                <h4 className="font-semibold mb-4">🌀 Decoherence Study</h4>
                <p className="text-gray-400 mb-4">
                  Study how quantum entanglement degrades over time and 
                  distance in different reality environments.
                </p>
                <Button variant="carbon" className="w-full">
                  Study Decoherence
                </Button>
              </Card>
            </div>

            <div className="mt-8 p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <h4 className="font-semibold text-yellow-300 mb-3">⚠️ Experimental Notice</h4>
              <p className="text-gray-300">
                These experiments are for educational and research purposes. Running 
                experiments may temporarily affect your entangled assets. Always ensure 
                you have backups before proceeding with quantum experiments.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Entanglement