import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { type QuantumDNA as QuantumDNAType } from '../../types/quantum'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'

interface QuantumDNAProps {
  quantumDNA: QuantumDNAType
}

export const QuantumDNA: React.FC<QuantumDNAProps> = ({ quantumDNA }) => {
  const [activeStrand, setActiveStrand] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1)

  // Generate DNA-like sequences from the quantum signature
  const generateDNASequence = (signature: string) => {
    const bases = ['A', 'T', 'G', 'C']
    const sequence = []

    for (let i = 0; i < signature.length; i += 2) {
      const charCode = signature.charCodeAt(i)
      sequence.push(bases[charCode % 4])
    }

    return sequence.slice(0, 32) // Limit to 32 bases for display
  }

  const dnaSequence = generateDNASequence(quantumDNA.signature)
  const complementSequence = dnaSequence.map(base => {
    switch (base) {
      case 'A': return 'T'
      case 'T': return 'A'
      case 'G': return 'C'
      case 'C': return 'G'
      default: return base
    }
  })

  const getBaseColor = (base: string) => {
    switch (base) {
      case 'A': return 'text-red-400'
      case 'T': return 'text-blue-400'
      case 'G': return 'text-green-400'
      case 'C': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getBaseGlow = (base: string) => {
    switch (base) {
      case 'A': return 'shadow-red-400/50'
      case 'T': return 'shadow-blue-400/50'
      case 'G': return 'shadow-green-400/50'
      case 'C': return 'shadow-yellow-400/50'
      default: return 'shadow-gray-400/50'
    }
  }

  return (
    <Card variant="quantum" gradient className="relative overflow-hidden">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold font-quantum mb-2">
              Quantum DNA Structure
            </h3>
            <p className="text-gray-400">
              Your unique quantum genetic signature
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="physics"
              size="sm"
              onClick={() => setAnimationSpeed(animationSpeed === 1 ? 2 : 1)}
            >
              Speed: {animationSpeed}x
            </Button>
          </div>
        </div>

        {/* DNA Properties */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-800/50 rounded-lg text-center">
            <div className="text-xl font-mono text-quantum-400 mb-1">
              {quantumDNA.entropy.toFixed(3)}
            </div>
            <div className="text-xs text-gray-400">Entropy Level</div>
          </div>

          <div className="p-3 bg-gray-800/50 rounded-lg text-center">
            <div className="text-xl font-mono text-physics-400 mb-1">
              {quantumDNA.encryptionLevel}
            </div>
            <div className="text-xs text-gray-400">Encryption Bits</div>
          </div>

          <div className="p-3 bg-gray-800/50 rounded-lg text-center">
            <div className="text-xl font-mono text-carbon-400 mb-1">
              {dnaSequence.length}
            </div>
            <div className="text-xs text-gray-400">Base Pairs</div>
          </div>

          <div className="p-3 bg-gray-800/50 rounded-lg text-center">
            <div className="text-xl font-mono text-ai-400 mb-1">
              {quantumDNA.signature.slice(0, 4)}
            </div>
            <div className="text-xs text-gray-400">Signature</div>
          </div>
        </div>

        {/* DNA Helix Visualization */}
        <div className="relative">
          <div className="bg-gray-800/30 rounded-lg p-6 overflow-hidden">
            <div className="relative h-64">
              {/* Background Grid */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute border-l border-gray-600"
                    style={{ left: `${(i + 1) * 12.5}%`, height: '100%' }}
                  />
                ))}
              </div>

              {/* DNA Strands */}
              <div className="relative h-full flex items-center">
                <div className="w-full">
                  {/* Top Strand */}
                  <div className="flex justify-between items-center mb-8">
                    {dnaSequence.map((base, index) => (
                      <motion.div
                        key={`top-${index}`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ 
                          opacity: 1, 
                          y: Math.sin((index * 0.5) + (Date.now() * 0.001 * animationSpeed)) * 20,
                          scale: activeStrand === 0 ? 1.2 : 1
                        }}
                        transition={{ 
                          delay: index * 0.1,
                          duration: 0.5
                        }}
                        className={clsx(
                          'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer transition-all duration-300',
                          'bg-gray-700 border-2 shadow-lg',
                          getBaseColor(base),
                          activeStrand === 0 ? 'border-quantum-400 shadow-lg ' + getBaseGlow(base) : 'border-gray-600'
                        )}
                        onClick={() => setActiveStrand(0)}
                      >
                        {base}
                      </motion.div>
                    ))}
                  </div>

                  {/* Connecting Lines */}
                  <div className="relative mb-8">
                    <div className="absolute inset-0 flex justify-between items-center">
                      {dnaSequence.map((_, index) => (
                        <motion.div
                          key={`connection-${index}`}
                          className="w-0.5 h-12 bg-gradient-to-b from-quantum-400 to-physics-400"
                          animate={{
                            opacity: [0.3, 1, 0.3],
                            scaleY: [0.8, 1.2, 0.8]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.1 * animationSpeed
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bottom Strand */}
                  <div className="flex justify-between items-center">
                    {complementSequence.map((base, index) => (
                      <motion.div
                        key={`bottom-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: Math.sin((index * 0.5) + (Date.now() * 0.001 * animationSpeed) + Math.PI) * 20,
                          scale: activeStrand === 1 ? 1.2 : 1
                        }}
                        transition={{ 
                          delay: index * 0.1,
                          duration: 0.5
                        }}
                        className={clsx(
                          'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer transition-all duration-300',
                          'bg-gray-700 border-2 shadow-lg',
                          getBaseColor(base),
                          activeStrand === 1 ? 'border-physics-400 shadow-lg ' + getBaseGlow(base) : 'border-gray-600'
                        )}
                        onClick={() => setActiveStrand(1)}
                      >
                        {base}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sequence Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800/30 rounded-lg">
            <h4 className="font-semibold mb-3 text-quantum-400">
              Primary Strand (5' → 3')
            </h4>
            <div className="font-mono text-sm bg-gray-700/50 p-3 rounded break-all">
              {dnaSequence.map((base, index) => (
                <span
                  key={index}
                  className={clsx(
                    getBaseColor(base),
                    'hover:bg-gray-600 px-1 rounded cursor-pointer transition-colors'
                  )}
                  onClick={() => setActiveStrand(0)}
                >
                  {base}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-800/30 rounded-lg">
            <h4 className="font-semibold mb-3 text-physics-400">
              Complement Strand (3' → 5')
            </h4>
            <div className="font-mono text-sm bg-gray-700/50 p-3 rounded break-all">
              {complementSequence.map((base, index) => (
                <span
                  key={index}
                  className={clsx(
                    getBaseColor(base),
                    'hover:bg-gray-600 px-1 rounded cursor-pointer transition-colors'
                  )}
                  onClick={() => setActiveStrand(1)}
                >
                  {base}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quantum State Visualization */}
        <div className="p-4 bg-gray-800/30 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span>⚛️</span>
            Quantum State Parameters
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Superposition</span>
                <span className="text-sm text-quantum-400">
                  {(quantumDNA.quantumState.superposition * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-quantum-400 to-quantum-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${quantumDNA.quantumState.superposition * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Entanglement</span>
                <span className="text-sm text-physics-400">
                  {(quantumDNA.quantumState.entanglement * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-physics-400 to-physics-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${quantumDNA.quantumState.entanglement * 100}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Coherence</span>
                <span className="text-sm text-carbon-400">
                  {(quantumDNA.quantumState.coherence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-carbon-400 to-carbon-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${quantumDNA.quantumState.coherence * 100}%` }}
                  transition={{ duration: 1, delay: 0.9 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default QuantumDNA