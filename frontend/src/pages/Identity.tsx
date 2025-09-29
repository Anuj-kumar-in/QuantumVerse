import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuantum } from '../hooks/useQuantum'
import { useAccount } from '../hooks/useHedera'
import QuantumIdentity from '../components/quantum/QuantumIdentity'
import QuantumDNA from '../components/quantum/QuantumDNA'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

export const Identity: React.FC = () => {
  const { state } = useQuantum()
  const account = useAccount()
  const [activeTab, setActiveTab] = useState('identity')

  const tabs = [
    { id: 'identity', label: 'Quantum Identity', icon: '🔐' },
    { id: 'dna', label: 'Quantum DNA', icon: '🧬' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'backup', label: 'Backup & Recovery', icon: '💾' }
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
              Quantum{' '}
              <span className="bg-gradient-to-r from-quantum-400 to-purple-400 bg-clip-text text-transparent">
                Identity
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Your quantum-secured digital identity that persists across all realities.
              Post-quantum cryptography ensures your identity remains secure in the quantum age.
            </p>

            {!state.identity && (
              <Button variant="quantum" size="lg" quantum glow>
                Generate Quantum Identity
              </Button>
            )}
          </motion.div>
        </div>
      </Card>

      {/* Identity Status */}
      {state.identity && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card variant="quantum" className="text-center">
            <div className="text-3xl mb-2">🔐</div>
            <div className="text-lg font-bold text-quantum-400">
              {state.identity.securityLevel}
            </div>
            <div className="text-sm text-gray-400">Security Level</div>
          </Card>

          <Card variant="physics" className="text-center">
            <div className="text-3xl mb-2">🌌</div>
            <div className="text-lg font-bold text-physics-400">
              {state.entanglements.length}
            </div>
            <div className="text-sm text-gray-400">Entanglements</div>
          </Card>

          <Card variant="ai" className="text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-lg font-bold text-ai-400">
              {state.identity.achievements.length}
            </div>
            <div className="text-sm text-gray-400">Achievements</div>
          </Card>

          <Card variant="carbon" className="text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-lg font-bold text-carbon-400">
              {Math.floor((Date.now() - state.identity.createdAt.getTime()) / (1000 * 60 * 60 * 24))}d
            </div>
            <div className="text-sm text-gray-400">Identity Age</div>
          </Card>
        </div>
      )}

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
        {activeTab === 'identity' && <QuantumIdentity />}

        {activeTab === 'dna' && state.identity && (
          <QuantumDNA quantumDNA={state.identity.quantumDNA} />
        )}

        {activeTab === 'dna' && !state.identity && (
          <Card variant="quantum" className="text-center py-12">
            <div className="text-6xl mb-4">🧬</div>
            <h3 className="text-xl font-semibold mb-2">Generate Identity First</h3>
            <p className="text-gray-400">
              Create your quantum identity to view your unique DNA structure
            </p>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card variant="default">
            <h3 className="text-xl font-semibold mb-6">Quantum Security Features</h3>

            <div className="space-y-6">
              <div className="p-6 bg-quantum-900/20 border border-quantum-500/30 rounded-lg">
                <h4 className="font-semibold text-quantum-300 mb-3">🔒 Post-Quantum Cryptography</h4>
                <p className="text-gray-300 mb-4">
                  Your identity uses quantum-resistant algorithms that remain secure even 
                  against quantum computer attacks.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-green-400">Active & Protected</span>
                </div>
              </div>

              <div className="p-6 bg-physics-900/20 border border-physics-500/30 rounded-lg">
                <h4 className="font-semibold text-physics-300 mb-3">🌍 Multi-Reality Verification</h4>
                <p className="text-gray-300 mb-4">
                  Your identity is verified and synchronized across virtual, augmented, 
                  and physical realities.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Virtual', 'Augmented', 'Physical', 'Mixed'].map((reality) => (
                    <div key={reality} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm">{reality}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-ai-900/20 border border-ai-500/30 rounded-lg">
                <h4 className="font-semibold text-ai-300 mb-3">🔐 Biometric Integration</h4>
                <p className="text-gray-300 mb-4">
                  Optional biometric factors can be encrypted and stored as part of your 
                  quantum identity for enhanced security.
                </p>
                <Button variant="ai" size="sm">
                  Configure Biometrics
                </Button>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'backup' && (
          <Card variant="default">
            <h3 className="text-xl font-semibold mb-6">Backup & Recovery</h3>

            <div className="space-y-6">
              <div className="p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <h4 className="font-semibold text-yellow-300 mb-3">⚠️ Important Security Notice</h4>
                <p className="text-gray-300 mb-4">
                  Your quantum identity cannot be recovered if lost. Please ensure you have 
                  secure backups stored in multiple locations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card variant="quantum">
                  <h4 className="font-semibold mb-4">🔑 Recovery Phrase</h4>
                  <p className="text-gray-400 mb-4">
                    Generate a quantum-encrypted recovery phrase for your identity.
                  </p>
                  <Button variant="quantum" className="w-full">
                    Generate Recovery Phrase
                  </Button>
                </Card>

                <Card variant="physics">
                  <h4 className="font-semibold mb-4">💾 Quantum Backup</h4>
                  <p className="text-gray-400 mb-4">
                    Create an encrypted backup of your quantum DNA structure.
                  </p>
                  <Button variant="physics" className="w-full">
                    Create Quantum Backup
                  </Button>
                </Card>
              </div>

              <div className="p-6 bg-green-900/20 border border-green-500/30 rounded-lg">
                <h4 className="font-semibold text-green-300 mb-3">✅ Best Practices</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• Store recovery phrase in multiple secure locations</li>
                  <li>• Never share your quantum identity with anyone</li>
                  <li>• Regularly verify your backups are accessible</li>
                  <li>• Use hardware security modules when available</li>
                  <li>• Monitor your identity for unauthorized access</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Identity