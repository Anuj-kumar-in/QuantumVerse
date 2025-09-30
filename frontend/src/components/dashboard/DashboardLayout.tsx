import React from 'react'
import { useAccount } from '../../hooks/useHedera'
import { useQuantum } from '../../hooks/useQuantum'
import { usePhysics } from '../../hooks/usePhysics'
import { useAI } from '../../hooks/useAI'
import { useCarbon } from '../../hooks/useCarbon'
import Card from '../../components/common/Card'
import StatsOverview from './StatsOverview'
import TokenBalances from './TokenBalances'
import ActivityFeed from './ActivityFeed'

export const DashboardLayout: React.FC = () => {
  const account = useAccount()
  const { state: quantumState } = useQuantum()
  const { state: physicsState } = usePhysics()
  const { entities } = useAI()
  const { metrics } = useCarbon()

  if (!account) {
    return (
      <Card variant="quantum" className="text-center">
        <div className="py-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-quantum-500/20 flex items-center justify-center">
            <span className="text-4xl">🌌</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">Welcome to QuantumVerse</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to access your quantum-secured multi-reality dashboard
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card variant="quantum" gradient className="relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-quantum mb-2">
            Welcome back to QuantumVerse
          </h1>
          <p className="text-gray-400">
            Your multi-reality gaming ecosystem dashboard
          </p>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl text-quantum-400 font-bold">
                {quantumState.identity ? '1' : '0'}
              </div>
              <div className="text-sm text-gray-400">Quantum Identity</div>
            </div>

            <div className="text-center">
              <div className="text-2xl text-physics-400 font-bold">
                {physicsState.nfts.length}
              </div>
              <div className="text-sm text-gray-400">Physics NFTs</div>
            </div>

            <div className="text-center">
              <div className="text-2xl text-ai-400 font-bold">
                {entities.length}
              </div>
              <div className="text-sm text-gray-400">AI Entities</div>
            </div>

            <div className="text-center">
              <div className="text-2xl text-carbon-400 font-bold">
                {metrics?.totalOffset.toFixed(1) || '0.0'}
              </div>
              <div className="text-sm text-gray-400">Carbon Offset</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <StatsOverview />
          <ActivityFeed />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <TokenBalances />
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout