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
  const { entities, isLoading, createEntity, refreshEntities } = useAI()
  const account = useAccount()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const [filter, setFilter] = useState<EntityType | 'ALL'>('ALL')
  const [creationForm, setCreationForm] = useState({
    type: EntityType.COMPANION,
    name: '',
    personality: 'Friendly and helpful'
  })

  const getEntityTypeIcon = (type: EntityType) => {
    switch (type) {
      case EntityType.COMPANION: return '🤖'
      case EntityType.GUARDIAN: return '🛡️'
      case EntityType.TRADER: return '💼'
      case EntityType.EXPLORER: return '🗺️'
      case EntityType.CREATOR: return '🎨'
      case EntityType.RESEARCHER: return '🔬'
      default: return '❓'
    }
  }

  const handleCreateEntity = async () => {
    if (!creationForm.name.trim()) return

    const entity = await createEntity(creationForm.type, creationForm.name)
    if (entity) {
      setShowCreateModal(false)
      setCreationForm({
        type: EntityType.COMPANION,
        name: '',
        personality: 'Friendly and helpful'
      })
      refreshEntities()
    }
  }

  const filteredEntities = entities.filter(entity => 
    filter === 'ALL' || entity.type === filter
  )

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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader variant="ai" size="xl" text="Loading AI entities..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
                onClick={() => setShowCreateModal(true)}
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
                {Object.values(EntityType).length}
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

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'ALL' ? 'ai' : 'secondary'}
          size="sm"
          onClick={() => setFilter('ALL')}
        >
          All Types
        </Button>

        {Object.values(EntityType).map((type) => (
          <Button
            key={type}
            variant={filter === type ? 'ai' : 'secondary'}
            size="sm"
            onClick={() => setFilter(type)}
          >
            {getEntityTypeIcon(type)} {type}
          </Button>
        ))}
      </div>

      {/* Entity Grid */}
      {filteredEntities.length === 0 ? (
        <Card variant="default" className="text-center">
          <div className="py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No AI Entities Found</h3>
            <p className="text-gray-400 mb-6">
              Create your first AI entity to start building your autonomous team
            </p>
            <Button
              variant="ai"
              onClick={() => setShowCreateModal(true)}
            >
              Create First Entity
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

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Entity Type
              </label>
              <select
                value={creationForm.type}
                onChange={(e) => setCreationForm(prev => ({ ...prev, type: e.target.value as EntityType }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-ai-400 focus:outline-none"
              >
                {Object.values(EntityType).map((type) => (
                  <option key={type} value={type}>
                    {getEntityTypeIcon(type)} {type}
                  </option>
                ))}
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

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Personality Trait
              </label>
              <select
                value={creationForm.personality}
                onChange={(e) => setCreationForm(prev => ({ ...prev, personality: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-ai-400 focus:outline-none"
              >
                <option value="Friendly and helpful">Friendly and helpful</option>
                <option value="Analytical and logical">Analytical and logical</option>
                <option value="Creative and artistic">Creative and artistic</option>
                <option value="Protective and vigilant">Protective and vigilant</option>
                <option value="Adventurous and curious">Adventurous and curious</option>
                <option value="Strategic and calculated">Strategic and calculated</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-ai-900/20 border border-ai-500/30 rounded-lg">
            <h5 className="font-semibold text-ai-300 mb-2">💰 Creation Cost</h5>
            <p className="text-sm text-ai-200">
              Basic AI Entity: 25 HBAR. The entity will begin with basic capabilities
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