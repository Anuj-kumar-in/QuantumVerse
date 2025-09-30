import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuantum } from '../../hooks/useQuantum'
import { useAccount } from '../../hooks/useHedera'
import { SecurityLevel, RealityType } from '../../types/quantum'
import Card from '../common/Card'
import Button from '../common/Button'
import Loader from '../common/Loader'
import clsx from 'clsx'
import QuantumDNA from './QuantumDNA'
import QuantumParticles from './QuantumParticles'

export const QuantumIdentity: React.FC = () => {
  const { state, generateQuantumIdentity, measureQuantumState } = useQuantum()
  const account = useAccount()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showDNA, setShowDNA] = useState(false)
  const [quantumMeasurement, setQuantumMeasurement] = useState<any>(null)

  useEffect(() => {
    if (state.identity && !quantumMeasurement) {
      measureQuantumState(state.identity.id).then(setQuantumMeasurement)
    }
  }, [state.identity, measureQuantumState, quantumMeasurement])

  const handleGenerateIdentity = async () => {
    setIsGenerating(true)
    try {
      const identity = await generateQuantumIdentity()
      if (identity) {
        setShowDNA(true)
      }
    } catch (error) {
      console.error('Failed to generate identity:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getSecurityColor = (level: SecurityLevel) => {
    switch (level) {
      case SecurityLevel.BASIC: return 'text-yellow-400'
      case SecurityLevel.ENHANCED: return 'text-blue-400'
      case SecurityLevel.QUANTUM: return 'text-purple-400'
      case SecurityLevel.POST_QUANTUM: return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getSecurityIcon = (level: SecurityLevel) => {
    switch (level) {
      case SecurityLevel.BASIC: return '🔒'
      case SecurityLevel.ENHANCED: return '🔐'
      case SecurityLevel.QUANTUM: return '⚛️'
      case SecurityLevel.POST_QUANTUM: return '🌌'
      default: return '🔓'
    }
  }

  if (!account) {
    return (
      <Card variant="quantum" className="text-center">
        <div className="py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-quantum-500/20 flex items-center justify-center">
            <span className="text-2xl">🔐</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Wallet First</h3>
          <p className="text-gray-400">
            Connect your Hedera wallet to generate your quantum identity
          </p>
        </div>
      </Card>
    )
  }

  if (!state.identity) {
    return (
      <Card variant="quantum" gradient className="relative overflow-hidden">
        <QuantumParticles count={20} />

        <div className="relative z-10 text-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-quantum-400 to-physics-400 flex items-center justify-center"
          >
            <span className="text-3xl">⚛️</span>
          </motion.div>

          <h3 className="text-2xl font-bold font-quantum mb-4">
            Generate Quantum Identity
          </h3>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Create your unique quantum-secured digital DNA that will persist 
            across all realities in the QuantumVerse
          </p>

          <Button
            variant="quantum"
            size="lg"
            onClick={handleGenerateIdentity}
            loading={isGenerating}
            quantum
            glow
          >
            <span className="text-xl mr-2">⚛️</span>
            Generate Quantum DNA
          </Button>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-quantum-900/20 rounded-lg">
              <div className="text-quantum-400 mb-1">🔐 Quantum Secure</div>
              <div className="text-gray-400">256-bit quantum resistance</div>
            </div>
            <div className="p-3 bg-physics-900/20 rounded-lg">
              <div className="text-physics-400 mb-1">🌌 Cross-Reality</div>
              <div className="text-gray-400">Works in VR, AR & Physical</div>
            </div>
            <div className="p-3 bg-carbon-900/20 rounded-lg">
              <div className="text-carbon-400 mb-1">♻️ Sustainable</div>
              <div className="text-gray-400">Carbon-negative creation</div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Identity Overview */}
      <Card variant="quantum" gradient glow className="relative overflow-hidden">
        <QuantumParticles count={15} />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  rotate: [0, 180, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-quantum-400 to-physics-400 flex items-center justify-center"
              >
                <span className="text-2xl">⚛️</span>
              </motion.div>

              <div>
                <h3 className="text-xl font-bold font-quantum">Quantum Identity Active</h3>
                <p className="text-gray-400">
                  ID: {state.identity.id.slice(-12)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="physics"
                size="sm"
                onClick={() => setShowDNA(!showDNA)}
              >
                {showDNA ? 'Hide' : 'Show'} DNA
              </Button>
            </div>
          </div>

          {/* Security Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {getSecurityIcon(state.identity.securityLevel)}
                </span>
                <span className={clsx(
                  'font-semibold',
                  getSecurityColor(state.identity.securityLevel)
                )}>
                  {state.identity.securityLevel}
                </span>
              </div>
              <p className="text-xs text-gray-400">Security Level</p>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl text-quantum-400 mb-1">
                {state.identity.quantumDNA.encryptionLevel}
              </div>
              <p className="text-xs text-gray-400">Encryption Bits</p>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl text-physics-400 mb-1">
                {state.entanglements.length}
              </div>
              <p className="text-xs text-gray-400">Entanglements</p>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl text-carbon-400 mb-1">
                {state.identity.achievements.length}
              </div>
              <p className="text-xs text-gray-400">Achievements</p>
            </div>
          </div>

          {/* Quantum State */}
          {quantumMeasurement && (
            <div className="p-4 bg-gray-800/30 rounded-lg backdrop-blur-sm">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span>📊</span>
                Current Quantum State
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Superposition</span>
                    <span className="text-sm text-quantum-400">
                      {(quantumMeasurement.superposition * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-quantum-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${quantumMeasurement.superposition * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Entanglement</span>
                    <span className="text-sm text-physics-400">
                      {(quantumMeasurement.entanglement * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-physics-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${quantumMeasurement.entanglement * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Coherence</span>
                    <span className="text-sm text-carbon-400">
                      {(quantumMeasurement.coherence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-carbon-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${quantumMeasurement.coherence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cross-Reality Status */}
          <div className="p-4 bg-gray-800/30 rounded-lg backdrop-blur-sm">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>🌍</span>
              Cross-Reality Status
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.values(RealityType).map((reality) => (
                <div
                  key={reality}
                  className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm">{reality}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* DNA Visualization */}
      <AnimatePresence>
        {showDNA && state.identity && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <QuantumDNA quantumDNA={state.identity.quantumDNA} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default QuantumIdentity