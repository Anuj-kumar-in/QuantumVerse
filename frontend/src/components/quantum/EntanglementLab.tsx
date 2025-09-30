import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuantum } from '../../hooks/useQuantum'
import { useAccount } from '../../hooks/useHedera'
import {type  QuantumEntanglement, SyncStatus, RealityType, AssetType } from '../../types/quantum'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Loader from '../../components/common/Loader'
import QuantumParticles from './QuantumParticles'

export const EntanglementLab: React.FC = () => {
  const { state, createEntanglement, synchronizeEntanglement } = useQuantum()
  const account = useAccount()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEntanglement, setSelectedEntanglement] = useState<QuantumEntanglement | null>(null)
  const [creationForm, setCreationForm] = useState({
    assetIdA: '',
    assetIdB: '',
    realityTypeA: RealityType.VIRTUAL,
    realityTypeB: RealityType.AUGMENTED
  })

  const handleCreateEntanglement = async () => {
    if (!creationForm.assetIdA || !creationForm.assetIdB) return

    const entanglement = await createEntanglement(
      creationForm.assetIdA,
      creationForm.assetIdB,
      creationForm.realityTypeA,
      creationForm.realityTypeB
    )

    if (entanglement) {
      setShowCreateModal(false)
      setCreationForm({
        assetIdA: '',
        assetIdB: '',
        realityTypeA: RealityType.VIRTUAL,
        realityTypeB: RealityType.AUGMENTED
      })
    }
  }

  const handleSync = async (entanglementId: string) => {
    const newState = {
      health: Math.floor(Math.random() * 100),
      position: {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        z: Math.random() * 100
      },
      timestamp: Date.now()
    }

    await synchronizeEntanglement(entanglementId, newState)
  }

  const getStatusColor = (status: SyncStatus) => {
    switch (status) {
      case SyncStatus.SYNCHRONIZED: return 'text-green-400'
      case SyncStatus.SYNCING: return 'text-yellow-400'
      case SyncStatus.DESYNCHRONIZED: return 'text-red-400'
      case SyncStatus.ERROR: return 'text-red-500'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: SyncStatus) => {
    switch (status) {
      case SyncStatus.SYNCHRONIZED: return '🟢'
      case SyncStatus.SYNCING: return '🟡'
      case SyncStatus.DESYNCHRONIZED: return '🔴'
      case SyncStatus.ERROR: return '💥'
      default: return '⚪'
    }
  }

  const getRealityIcon = (reality: RealityType) => {
    switch (reality) {
      case RealityType.VIRTUAL: return '🎮'
      case RealityType.AUGMENTED: return '📱'
      case RealityType.PHYSICAL: return '🌍'
      case RealityType.MIXED: return '🌀'
      default: return '❓'
    }
  }

  if (!account) {
    return (
      <Card variant="quantum" className="text-center">
        <div className="py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-quantum-500/20 flex items-center justify-center">
            <span className="text-2xl">🌌</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Wallet First</h3>
          <p className="text-gray-400">
            Connect your wallet to access the Quantum Entanglement Lab
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Lab Header */}
      <Card variant="quantum" gradient className="relative overflow-hidden">
        <QuantumParticles count={30} color="quantum" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-quantum-400 to-physics-400 flex items-center justify-center"
              >
                <span className="text-2xl">🌌</span>
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold font-quantum">Quantum Entanglement Lab</h2>
                <p className="text-gray-400">
                  Create and manage quantum entangled asset pairs
                </p>
              </div>
            </div>

            <Button
              variant="quantum"
              onClick={() => setShowCreateModal(true)}
              quantum
              glow
            >
              <span className="text-xl mr-2">⚛️</span>
              Create Entanglement
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl text-quantum-400 mb-1">
                {state.entanglements.length}
              </div>
              <p className="text-sm text-gray-400">Active Entanglements</p>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl text-physics-400 mb-1">
                {state.entanglements.filter(e => e.synchronizationStatus === SyncStatus.SYNCHRONIZED).length}
              </div>
              <p className="text-sm text-gray-400">Synchronized</p>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl text-carbon-400 mb-1">
                {state.entanglements.reduce((sum, e) => sum + e.entanglementStrength, 0).toFixed(1)}
              </div>
              <p className="text-sm text-gray-400">Total Strength</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Entanglement Grid */}
      {state.entanglements.length === 0 ? (
        <Card variant="default" className="text-center">
          <div className="py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-3xl">🌌</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Entanglements Yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first quantum entanglement to sync assets across realities
            </p>
            <Button
              variant="quantum"
              onClick={() => setShowCreateModal(true)}
            >
              Create First Entanglement
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {state.entanglements.map((entanglement) => (
            <Card
              key={entanglement.id}
              variant="quantum"
              hover
              onClick={() => setSelectedEntanglement(entanglement)}
              className="cursor-pointer"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-quantum-500/20 flex items-center justify-center">
                      <span className="text-xl">🌀</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        Entanglement #{entanglement.id.slice(-6)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={getStatusColor(entanglement.synchronizationStatus)}>
                          {getStatusIcon(entanglement.synchronizationStatus)} {entanglement.synchronizationStatus}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-quantum-400">
                          {(entanglement.entanglementStrength * 100).toFixed(1)}% strength
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="physics"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSync(entanglement.id)
                    }}
                    loading={state.isSyncing}
                  >
                    Sync
                  </Button>
                </div>

                {/* Asset Pairs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Asset A */}
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{getRealityIcon(entanglement.pairA.realityType)}</span>
                      <span className="font-medium">{entanglement.pairA.realityType}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">
                      Asset ID: {entanglement.pairA.assetId}
                    </p>
                    <p className="text-xs text-gray-500">
                      Type: {entanglement.pairA.assetType}
                    </p>
                  </div>

                  {/* Connection Visualization */}
                  <div className="md:col-span-2 flex items-center justify-center">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full bg-quantum-400 animate-pulse" />
                      <motion.div
                        className="flex-1 h-0.5 bg-gradient-to-r from-quantum-400 to-physics-400"
                        animate={{
                          opacity: [0.3, 1, 0.3],
                          scaleX: [0.8, 1.2, 0.8]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <div className="w-4 h-4 rounded-full bg-physics-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Asset B */}
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{getRealityIcon(entanglement.pairB.realityType)}</span>
                      <span className="font-medium">{entanglement.pairB.realityType}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">
                      Asset ID: {entanglement.pairB.assetId}
                    </p>
                    <p className="text-xs text-gray-500">
                      Type: {entanglement.pairB.assetType}
                    </p>
                  </div>
                </div>

                {/* Properties */}
                <div className="flex flex-wrap gap-2">
                  {entanglement.properties.map((prop) => (
                    <span
                      key={prop.name}
                      className="px-2 py-1 text-xs bg-quantum-500/20 text-quantum-300 rounded-full"
                    >
                      {prop.name} {prop.bidirectional ? '↔' : '→'}
                    </span>
                  ))}
                </div>

                {/* Last Sync */}
                <p className="text-xs text-gray-500">
                  Last sync: {entanglement.lastSync.toLocaleString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Entanglement Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Quantum Entanglement"
        variant="quantum"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-gray-400">
            Create a quantum entanglement between two assets across different realities.
            Changes to one asset will instantly affect the other through quantum synchronization.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Asset A */}
            <div className="space-y-4">
              <h4 className="font-semibold text-quantum-400">Asset A</h4>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Asset ID
                </label>
                <input
                  type="text"
                  value={creationForm.assetIdA}
                  onChange={(e) => setCreationForm(prev => ({ ...prev, assetIdA: e.target.value }))}
                  placeholder="Enter asset ID"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-quantum-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Reality Type
                </label>
                <select
                  value={creationForm.realityTypeA}
                  onChange={(e) => setCreationForm(prev => ({ ...prev, realityTypeA: e.target.value as RealityType }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-quantum-400 focus:outline-none"
                >
                  {Object.values(RealityType).map((type) => (
                    <option key={type} value={type}>
                      {getRealityIcon(type)} {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Asset B */}
            <div className="space-y-4">
              <h4 className="font-semibold text-physics-400">Asset B</h4>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Asset ID
                </label>
                <input
                  type="text"
                  value={creationForm.assetIdB}
                  onChange={(e) => setCreationForm(prev => ({ ...prev, assetIdB: e.target.value }))}
                  placeholder="Enter asset ID"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-quantum-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Reality Type
                </label>
                <select
                  value={creationForm.realityTypeB}
                  onChange={(e) => setCreationForm(prev => ({ ...prev, realityTypeB: e.target.value as RealityType }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-quantum-400 focus:outline-none"
                >
                  {Object.values(RealityType).map((type) => (
                    <option key={type} value={type}>
                      {getRealityIcon(type)} {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <h5 className="font-semibold text-blue-300 mb-2">🔗 Entanglement Properties</h5>
            <p className="text-sm text-blue-200">
              The following properties will be synchronized between assets:
              Health, Experience, Position, Inventory, Skills
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="quantum"
              onClick={handleCreateEntanglement}
              loading={state.isCreatingEntanglement}
              disabled={!creationForm.assetIdA || !creationForm.assetIdB}
              className="flex-1"
            >
              Create Entanglement
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Entanglement Details Modal */}
      <Modal
        isOpen={!!selectedEntanglement}
        onClose={() => setSelectedEntanglement(null)}
        title="Entanglement Details"
        variant="quantum"
        size="xl"
      >
        {selectedEntanglement && (
          <div className="space-y-6">
            {/* Details content would go here */}
            <p>Detailed view of entanglement {selectedEntanglement.id}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default EntanglementLab