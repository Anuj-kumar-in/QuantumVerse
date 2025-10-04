import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAI } from '../../hooks/useAI'
import { useAccount } from '../../hooks/useHedera'
import { EntityType } from '../../types/ai'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Loader from '../../components/common/Loader'
import AIEntityCard from './AIEntityCard'

export const AIEntityExplorer: React.FC = () => {
  const { entities, isLoading, error, createEntity, refreshEntities, clearError } = useAI()
  const account = useAccount()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const [filter, setFilter] = useState<EntityType | 'ALL'>('ALL')
  const [creationForm, setCreationForm] = useState({
    type: EntityType.COMPANION,
    name: '',
    personality: 'Friendly and helpful'
  })

  // ✅ Fixed helper functions
  const getEntityTypeFromNumber = (num: number): EntityType => {
    return num as EntityType // Direct cast since enum values are 0,1,2,3,4,5
  }

  const getEntityTypeName = (type: EntityType): string => {
    switch (type) {
      case EntityType.COMPANION: return 'COMPANION'
      case EntityType.GUARDIAN: return 'GUARDIAN'
      case EntityType.TRADER: return 'TRADER'
      case EntityType.EXPLORER: return 'EXPLORER'
      case EntityType.CREATOR: return 'CREATOR'
      case EntityType.SCIENTIST: return 'SCIENTIST'
      default: return 'UNKNOWN'
    }
  }

  const getEntityTypeIcon = (type: EntityType) => {
    switch (type) {
      case EntityType.COMPANION: return '🤖'
      case EntityType.GUARDIAN: return '🛡️'
      case EntityType.TRADER: return '💼'
      case EntityType.EXPLORER: return '🗺️'
      case EntityType.CREATOR: return '🎨'
      case EntityType.SCIENTIST: return '🔬'
      default: return '❓'
    }
  }

  const handleOpenCreateModal = () => {
    clearError()
    setShowCreateModal(true)
  }

  const handleCreateEntity = async () => {
    if (!creationForm.name.trim()) return

    console.log('Creating entity with type:', creationForm.type)

    const entity = await createEntity(creationForm.type, creationForm.name)
    if (entity) {
      setShowCreateModal(false)
      setShowSuccessAnimation(true)
      
      setCreationForm({
        type: EntityType.COMPANION,
        name: '',
        personality: 'Friendly and helpful'
      })
      
      setTimeout(() => {
        setShowSuccessAnimation(false)
      }, 3000)
      
      refreshEntities()
    }
  }

  // ✅ Fixed filtering logic
  const filteredEntities = entities.filter(entity => {
    console.log(`Entity ${entity.name}: type=${entity.type}, filter=${filter}`)
    
    if (filter === 'ALL') return true
    
    // Direct comparison of numeric types
    return entity.type === filter
  })

  console.log('Entities for filtering:', entities.map(e => ({ name: e.name, type: e.type })))
  console.log('Current filter:', filter)
  console.log('Filtered entities:', filteredEntities.map(e => ({ name: e.name, type: e.type })))

  if (!account) {
    return (
      <Card variant="ai" className="text-center">
        <div className="py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ai-500/20 flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Wallet First</h3>
          <p className="text-gray-400">
            Connect your wallet to explore AI entities
          </p>
        </div>
      </Card>
    )
  }

  if (error && !showCreateModal) {
    return (
      <Card variant="ai" className="text-center">
        <div className="py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-red-400">Error</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button variant="secondary" onClick={clearError}>
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader variant="ai" size="xl" text="Loading AI entities..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Animation */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card variant="ai" className="border-green-500/50 bg-green-900/20">
              <div className="flex items-center gap-3 p-4">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                  className="text-3xl"
                >
                  ✅
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-green-300">AI Entity Created Successfully!</h3>
                  <p className="text-sm text-green-200">Your new AI companion is ready to explore the QuantumVerse.</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <Card variant="ai" gradient className="relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-ai-400 to-yellow-400 flex items-center justify-center"
              >
                <span className="text-2xl">🤖</span>
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold font-quantum">AI Entity Explorer</h2>
                <p className="text-gray-400">
                  Discover and interact with autonomous AI entities
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={refreshEntities}
                loading={isLoading}
              >
                🔄 Refresh
              </Button>

              <Button
                variant="ai"
                onClick={handleOpenCreateModal}
                glow
              >
                <span className="text-xl mr-2">🤖</span>
                Create Entity
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl text-ai-400 mb-1">
                {entities.length}
              </div>
              <p className="text-sm text-gray-400">Total Entities</p>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl text-yellow-400 mb-1">
                6
              </div>
              <p className="text-sm text-gray-400">Entity Types</p>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl text-green-400 mb-1">
                {entities.filter(e => e.behavior.currentAction?.status === 'EXECUTING').length}
              </div>
              <p className="text-sm text-gray-400">Active</p>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl text-purple-400 mb-1">
                {entities.reduce((sum, e) => sum + parseFloat(e.earnings.totalEarned), 0).toFixed(0)}
              </div>
              <p className="text-sm text-gray-400">Total Earned</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ✅ Fixed Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'ALL' ? 'ai' : 'secondary'}
          size="sm"
          onClick={() => setFilter('ALL')}
        >
          All Types ({entities.length})
        </Button>

        {[
          EntityType.COMPANION,
          EntityType.GUARDIAN,
          EntityType.TRADER,
          EntityType.EXPLORER,
          EntityType.CREATOR,
          EntityType.SCIENTIST
        ].map((type) => {
          const count = entities.filter(e => e.type === type).length
          return (
            <Button
              key={type}
              variant={filter === type ? 'ai' : 'secondary'}
              size="sm"
              onClick={() => setFilter(type)}
            >
              {getEntityTypeIcon(type)} {getEntityTypeName(type)} ({count})
            </Button>
          )
        })}
      </div>

      {/* Entity Grid */}
      {filteredEntities.length === 0 ? (
        <Card variant="default" className="text-center">
          <div className="py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {filter === 'ALL' ? 'No AI Entities Found' : `No ${getEntityTypeName(filter as EntityType)} Entities`}
            </h3>
            <p className="text-gray-400 mb-6">
              {filter === 'ALL' 
                ? 'Create your first AI entity to start building your autonomous team'
                : `Create your first ${getEntityTypeName(filter as EntityType)} entity`
              }
            </p>
            <Button
              variant="ai"
              onClick={handleOpenCreateModal}
            >
              Create {filter === 'ALL' ? 'First' : getEntityTypeName(filter as EntityType)} Entity
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntities.map((entity) => (
            <AIEntityCard
              key={entity.id}
              entity={entity}
              onSelect={() => setSelectedEntity(entity)}
            />
          ))}
        </div>
      )}

      {/* Create Entity Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create AI Entity"
        variant="ai"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-gray-400">
            Create a new autonomous AI entity that will act independently in the QuantumVerse.
          </p>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-400">⚠️</span>
                <h5 className="font-semibold text-red-300">Creation Failed</h5>
              </div>
              <p className="text-sm text-red-200 mb-3">{error}</p>
              <Button variant="secondary" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Entity Type
              </label>
              <select
                value={creationForm.type}
                onChange={(e) => setCreationForm(prev => ({ 
                  ...prev, 
                  type: parseInt(e.target.value) as EntityType 
                }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-ai-400 focus:outline-none"
              >
                <option value={EntityType.COMPANION}>
                  {getEntityTypeIcon(EntityType.COMPANION)} COMPANION
                </option>
                <option value={EntityType.GUARDIAN}>
                  {getEntityTypeIcon(EntityType.GUARDIAN)} GUARDIAN
                </option>
                <option value={EntityType.TRADER}>
                  {getEntityTypeIcon(EntityType.TRADER)} TRADER
                </option>
                <option value={EntityType.EXPLORER}>
                  {getEntityTypeIcon(EntityType.EXPLORER)} EXPLORER
                </option>
                <option value={EntityType.CREATOR}>
                  {getEntityTypeIcon(EntityType.CREATOR)} CREATOR
                </option>
                <option value={EntityType.SCIENTIST}>
                  {getEntityTypeIcon(EntityType.SCIENTIST)} SCIENTIST
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Entity Name
              </label>
              <input
                type="text"
                value={creationForm.name}
                onChange={(e) => setCreationForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter a unique name for your AI entity"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-ai-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-ai-900/20 border border-ai-500/30 rounded-lg">
            <h5 className="font-semibold text-ai-300 mb-2">🆓 Free Creation</h5>
            <p className="text-sm text-ai-200">
              AI Entity creation is currently free for testing. The entity will begin with basic capabilities
              and evolve through interactions and experiences.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="ai"
              onClick={handleCreateEntity}
              disabled={!creationForm.name.trim()}
              className="flex-1"
            >
              Create AI Entity
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

      {/* Entity Details Modal */}
      <Modal
        isOpen={!!selectedEntity}
        onClose={() => setSelectedEntity(null)}
        title="AI Entity Details"
        variant="ai"
        size="xl"
      >
        {selectedEntity && (
          <div className="space-y-6">
            <p>Detailed view of {selectedEntity.name}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AIEntityExplorer
