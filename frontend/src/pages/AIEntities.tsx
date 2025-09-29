import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAI } from '../hooks/useAI'
import { useAccount } from '../hooks/useHedera'
import { EntityType } from '../types/ai'
import AIEntityExplorer from '../components/ai/AIEntityExplorer'
import AIEntityCard from '../components/ai/AIEntityCard'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'

export const AIEntities: React.FC = () => {
  const { entities, isLoading, createEntity, refreshEntities } = useAI()
  const account = useAccount()
  const [activeTab, setActiveTab] = useState('explorer')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creationForm, setCreationForm] = useState({
    type: EntityType.COMPANION,
    name: '',
    personality: 'Friendly and helpful'
  })

  const tabs = [
    { id: 'explorer', label: 'Entity Explorer', icon: '🔍' },
    { id: 'my-entities', label: 'My Entities', icon: '🤖' },
    { id: 'marketplace', label: 'Entity Market', icon: '💼' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' }
  ]

  const myEntities = entities.filter(entity => entity.creator === account?.accountId)
  const marketEntities = entities.filter(entity => entity.creator !== account?.accountId)

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

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card variant="ai" gradient className="relative overflow-hidden">
        <div className="relative z-10 text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold font-quantum mb-6">
              AI{' '}
              <span className="bg-gradient-to-r from-ai-400 to-yellow-400 bg-clip-text text-transparent">
                Entities
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Create, manage, and interact with autonomous AI entities that can own assets, 
              make decisions, and operate independently in the QuantumVerse ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="ai" 
                size="lg" 
                quantum 
                glow 
                onClick={() => setShowCreateModal(true)}
              >
                Create AI Entity
              </Button>
              <Button variant="secondary" size="lg">
                Browse Entities
              </Button>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* AI Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card variant="ai" className="text-center">
          <div className="text-3xl mb-2">🤖</div>
          <div className="text-2xl font-bold text-ai-400">{entities.length}</div>
          <div className="text-sm text-gray-400">Total Entities</div>
        </Card>

        <Card variant="quantum" className="text-center">
          <div className="text-3xl mb-2">👤</div>
          <div className="text-2xl font-bold text-quantum-400">{myEntities.length}</div>
          <div className="text-sm text-gray-400">My Entities</div>
        </Card>

        <Card variant="physics" className="text-center">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-physics-400">
            {entities.filter(e => e.behavior.currentAction?.status === 'EXECUTING').length}
          </div>
          <div className="text-sm text-gray-400">Active Now</div>
        </Card>

        <Card variant="carbon" className="text-center">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-carbon-400">
            {entities.reduce((sum, e) => sum + parseFloat(e.earnings.totalEarned), 0).toFixed(0)}
          </div>
          <div className="text-sm text-gray-400">Total Earned</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Card variant="default">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'ai' : 'secondary'}
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
        {activeTab === 'explorer' && <AIEntityExplorer />}

        {activeTab === 'my-entities' && (
          <div className="space-y-6">
            {myEntities.length === 0 ? (
              <Card variant="ai" className="text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2">No AI Entities Yet</h3>
                <p className="text-gray-400 mb-6">
                  Create your first AI entity to start building your autonomous team
                </p>
                <Button 
                  variant="ai" 
                  onClick={() => setShowCreateModal(true)}
                >
                  Create First Entity
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEntities.map((entity) => (
                  <AIEntityCard
                    key={entity.id}
                    entity={entity}
                    onSelect={() => console.log('Selected entity:', entity.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <Card variant="default">
              <h3 className="text-xl font-semibold mb-4">AI Entity Marketplace</h3>
              <p className="text-gray-400 mb-6">
                Discover and acquire AI entities created by other users. Each entity comes 
                with its own skills, reputation, and earning potential.
              </p>
            </Card>

            {marketEntities.length === 0 ? (
              <Card variant="ai" className="text-center py-12">
                <div className="text-6xl mb-4">🏪</div>
                <h3 className="text-xl font-semibold mb-2">Marketplace Coming Soon</h3>
                <p className="text-gray-400">
                  AI entity trading will be available soon. Create entities now to be ready!
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketEntities.slice(0, 6).map((entity) => (
                  <AIEntityCard
                    key={entity.id}
                    entity={entity}
                    onSelect={() => console.log('Selected entity:', entity.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <Card variant="default">
            <h3 className="text-xl font-semibold mb-6">AI Entity Leaderboard</h3>

            <div className="space-y-4">
              {entities
                .sort((a, b) => parseFloat(b.earnings.totalEarned) - parseFloat(a.earnings.totalEarned))
                .slice(0, 10)
                .map((entity, index) => (
                  <div 
                    key={entity.id}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold
                        ${index === 0 ? 'bg-yellow-500 text-black' : 
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :  
                          'bg-gray-600 text-white'}
                      `}>
                        {index + 1}
                      </div>

                      <div>
                        <h4 className="font-semibold">{entity.name}</h4>
                        <p className="text-sm text-gray-400">
                          {entity.type} • Level {entity.evolution.level}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-ai-400">
                        {parseFloat(entity.earnings.totalEarned).toFixed(2)} QUANTUM
                      </div>
                      <div className="text-sm text-gray-400">
                        {entity.evolution.experience} XP
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>

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
                    {type}
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
              Basic AI Entity: 100 QUANTUM tokens. The entity will begin with basic capabilities
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
    </div>
  )
}

export default AIEntities