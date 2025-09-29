import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCarbon } from '../hooks/useCarbon'
import { useAccount } from '../hooks/useHedera'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'

export const Carbon: React.FC = () => {
  const { metrics, submitAction, isLoading } = useCarbon()
  const account = useAccount()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionForm, setActionForm] = useState({
    type: 'renewable-energy',
    amount: '',
    description: '',
    proof: ''
  })

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'actions', label: 'Submit Action', icon: '🌱' },
    { id: 'marketplace', label: 'Marketplace', icon: '🏪' },
    { id: 'challenges', label: 'Challenges', icon: '🏆' },
    { id: 'impact', label: 'Global Impact', icon: '🌍' }
  ]

  const actionTypes = [
    { value: 'renewable-energy', label: '⚡ Renewable Energy', multiplier: '1.2x' },
    { value: 'tree-planting', label: '🌳 Tree Planting', multiplier: '2.0x' },
    { value: 'carbon-offset', label: '💨 Carbon Offset', multiplier: '1.5x' },
    { value: 'electric-vehicle', label: '🚗 Electric Vehicle', multiplier: '1.2x' },
    { value: 'energy-efficiency', label: '💡 Energy Efficiency', multiplier: '1.1x' },
    { value: 'recycling', label: '♻️ Recycling', multiplier: '1.0x' }
  ]

  const handleSubmitAction = async () => {
    if (!actionForm.amount || !actionForm.description) return

    const success = await submitAction({
      type: actionForm.type,
      carbonSaved: parseInt(actionForm.amount),
      description: actionForm.description,
      proof: actionForm.proof
    })

    if (success) {
      setShowActionModal(false)
      setActionForm({
        type: 'renewable-energy',
        amount: '',
        description: '',
        proof: ''
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card variant="carbon" gradient className="relative overflow-hidden">
        <div className="relative z-10 text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold font-quantum mb-6">
              Carbon{' '}
              <span className="bg-gradient-to-r from-carbon-400 to-green-400 bg-clip-text text-transparent">
                Rewards
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Earn rewards for verified environmental actions. Track your carbon footprint,
              participate in sustainability challenges, and make a real impact on the planet.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="carbon" 
                size="lg" 
                quantum 
                glow
                onClick={() => setShowActionModal(true)}
              >
                Submit Action
              </Button>
              <Button variant="secondary" size="lg">
                View Impact
              </Button>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* Environmental Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card variant="carbon" className="text-center">
          <div className="text-3xl mb-2">🌱</div>
          <div className="text-2xl font-bold text-carbon-400">
            {metrics?.totalOffset.toFixed(1) || '0.0'}
          </div>
          <div className="text-sm text-gray-400">Tons CO₂ Offset</div>
        </Card>

        <Card variant="quantum" className="text-center">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-quantum-400">
            {metrics?.totalRewards.toFixed(0) || '0'}
          </div>
          <div className="text-sm text-gray-400">CARBON Earned</div>
        </Card>

        <Card variant="physics" className="text-center">
          <div className="text-3xl mb-2">🌳</div>
          <div className="text-2xl font-bold text-physics-400">
            {metrics?.treesPlanted || 0}
          </div>
          <div className="text-sm text-gray-400">Trees Planted</div>
        </Card>

        <Card variant="ai" className="text-center">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-ai-400">
            {metrics?.renewableHours || 0}
          </div>
          <div className="text-sm text-gray-400">Renewable Hours</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Card variant="default">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'carbon' : 'secondary'}
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
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <Card variant="default">
              <h3 className="text-xl font-semibold mb-6">Your Environmental Impact</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-carbon-900/20 border border-carbon-500/30 rounded-lg">
                  <h4 className="font-semibold text-carbon-300 mb-4">🌍 Global Ranking</h4>
                  <div className="text-3xl font-bold text-carbon-400 mb-2">#247</div>
                  <p className="text-gray-400">Out of 10,000+ participants</p>
                  <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-carbon-400 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Top 25% contributor</p>
                </div>

                <div className="p-6 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <h4 className="font-semibold text-green-300 mb-4">🎯 This Month's Goal</h4>
                  <div className="text-3xl font-bold text-green-400 mb-2">2.5 / 5.0</div>
                  <p className="text-gray-400">Tons CO₂ to offset</p>
                  <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">50% complete</p>
                </div>
              </div>
            </Card>

            <Card variant="default">
              <h3 className="text-xl font-semibold mb-6">Recent Actions</h3>

              <div className="space-y-4">
                {[
                  { type: 'tree-planting', amount: '10 trees', time: '2 hours ago', status: 'verified', reward: '50 CARBON' },
                  { type: 'solar-energy', amount: '24 kWh', time: '1 day ago', status: 'verified', reward: '12 CARBON' },
                  { type: 'recycling', amount: '5 kg', time: '3 days ago', status: 'pending', reward: '5 CARBON' }
                ].map((action, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">
                        {action.type === 'tree-planting' ? '🌳' : 
                         action.type === 'solar-energy' ? '☀️' : '♻️'}
                      </div>

                      <div>
                        <h4 className="font-semibold capitalize">
                          {action.type.replace('-', ' ')}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {action.amount} • {action.time}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-semibold mb-1 ${
                        action.status === 'verified' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {action.status === 'verified' ? '✅ Verified' : '⏳ Pending'}
                      </div>
                      <div className="text-carbon-400 font-bold">
                        {action.reward}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'actions' && (
          <Card variant="default">
            <h3 className="text-xl font-semibold mb-6">Submit Environmental Action</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Action Type
                  </label>
                  <select
                    value={actionForm.type}
                    onChange={(e) => setActionForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-carbon-400 focus:outline-none"
                  >
                    {actionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} (Reward: {type.multiplier})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Carbon Saved (grams)
                  </label>
                  <input
                    type="number"
                    value={actionForm.amount}
                    onChange={(e) => setActionForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount of CO₂ saved"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-carbon-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={actionForm.description}
                    onChange={(e) => setActionForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your environmental action..."
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-carbon-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Proof (Optional)
                  </label>
                  <input
                    type="text"
                    value={actionForm.proof}
                    onChange={(e) => setActionForm(prev => ({ ...prev, proof: e.target.value }))}
                    placeholder="Link to photo, receipt, or verification"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-carbon-400 focus:outline-none"
                  />
                </div>

                <Button
                  variant="carbon"
                  onClick={handleSubmitAction}
                  disabled={!actionForm.amount || !actionForm.description}
                  className="w-full"
                  loading={isLoading}
                >
                  Submit for Verification
                </Button>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-carbon-900/20 border border-carbon-500/30 rounded-lg">
                  <h4 className="font-semibold text-carbon-300 mb-4">💡 Tips for Higher Rewards</h4>
                  <ul className="text-gray-300 space-y-2">
                    <li>• Include photo proof for faster verification</li>
                    <li>• Tree planting has the highest reward multiplier (2x)</li>
                    <li>• Submit actions regularly to maintain streak bonuses</li>
                    <li>• Participate in monthly challenges for extra rewards</li>
                    <li>• Accurate measurements lead to better rewards</li>
                  </ul>
                </div>

                <div className="p-6 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <h4 className="font-semibold text-green-300 mb-4">🌱 Action Examples</h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium">Solar Energy Usage</h5>
                      <p className="text-sm text-gray-400">24 kWh = ~12,000g CO₂ saved = 14 CARBON</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Tree Planting</h5>
                      <p className="text-sm text-gray-400">1 tree = ~22,000g CO₂/year = 44 CARBON</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Electric Vehicle</h5>
                      <p className="text-sm text-gray-400">100 km = ~20,000g CO₂ saved = 24 CARBON</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'marketplace' && (
          <Card variant="carbon" className="text-center py-12">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold mb-2">Carbon Marketplace Coming Soon</h3>
            <p className="text-gray-400">
              Trade verified carbon credits, purchase offsets, and invest in environmental projects
            </p>
          </Card>
        )}

        {activeTab === 'challenges' && (
          <Card variant="default">
            <h3 className="text-xl font-semibold mb-6">Environmental Challenges</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="carbon">
                <h4 className="font-semibold mb-4">🌳 October Tree Challenge</h4>
                <p className="text-gray-400 mb-4">
                  Plant or adopt 10 trees this month and earn bonus rewards
                </p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress: 3/10 trees</span>
                    <span>30%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-carbon-400 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-carbon-400 font-bold">500 CARBON Reward</span>
                  <span className="text-sm text-gray-400">7 days left</span>
                </div>
              </Card>

              <Card variant="quantum">
                <h4 className="font-semibold mb-4">⚡ Renewable Energy Week</h4>
                <p className="text-gray-400 mb-4">
                  Use 100% renewable energy for one week straight
                </p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress: 5/7 days</span>
                    <span>71%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-quantum-400 h-2 rounded-full" style={{ width: '71%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-quantum-400 font-bold">300 CARBON Reward</span>
                  <span className="text-sm text-gray-400">2 days left</span>
                </div>
              </Card>
            </div>
          </Card>
        )}

        {activeTab === 'impact' && (
          <Card variant="default">
            <h3 className="text-xl font-semibold mb-6">Global Environmental Impact</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-carbon-400 mb-2">12,543</div>
                <div className="text-gray-400">Tons CO₂ Offset Globally</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">47,821</div>
                <div className="text-gray-400">Trees Planted Worldwide</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">15,234</div>
                <div className="text-gray-400">Active Eco-Warriors</div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-green-900/20 to-carbon-900/20 border border-green-500/30 rounded-lg">
              <h4 className="font-semibold text-green-300 mb-4">🌍 Real-World Impact</h4>
              <p className="text-gray-300 mb-6">
                The QuantumVerse community has collectively offset the carbon footprint 
                equivalent to taking 2,700 cars off the road for one year. Our verified 
                environmental actions are making a real difference for the planet.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold mb-2">🌳 Reforestation Projects</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Amazon Rainforest: 12,000 trees</li>
                    <li>• Kenya Drylands: 8,500 trees</li>
                    <li>• California Wildfires Recovery: 6,200 trees</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">⚡ Renewable Energy Support</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Solar farm investments: 2.5 MW</li>
                    <li>• Wind energy support: 1.8 MW</li>
                    <li>• Community solar projects: 47 installations</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Submit Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title="Quick Action Submit"
        variant="carbon"
      >
        <div className="space-y-4">
          <p className="text-gray-400">
            Quickly submit an environmental action for verification and rewards.
          </p>

          <div>
            <select
              value={actionForm.type}
              onChange={(e) => setActionForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-carbon-400 focus:outline-none"
            >
              {actionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <Button
              variant="carbon"
              onClick={() => {
                setShowActionModal(false)
                setActiveTab('actions')
              }}
              className="flex-1"
            >
              Full Form
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowActionModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Carbon