import React from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useAccount } from '../../hooks/useHedera'
import { useQuantum } from '../../hooks/useQuantum'
import { usePhysics } from '../../hooks/usePhysics'
import Card from '../../components/common/Card'

export const StatsOverview: React.FC = () => {
  const account = useAccount()
  const { state: quantumState } = useQuantum()
  const { state: physicsState } = usePhysics()

  const stats = [
    {
      title: 'HBAR Balance',
      value: account?.balance ? `${parseFloat(account.balance).toFixed(2)} ℏ` : '0.00 ℏ',
      change: '+5.2%',
      icon: '💰',
      color: 'text-green-400'
    },
    {
      title: 'Quantum Entanglements',
      value: quantumState.entanglements.length.toString(),
      change: '+2',
      icon: '🌌',
      color: 'text-quantum-400'
    },
    {
      title: 'Physics NFTs',
      value: physicsState.nfts.length.toString(),
      change: '+1',
      icon: '⚡',
      color: 'text-physics-400'
    },
    {
      title: 'Carbon Offset',
      value: '45.7 tons',
      change: '+12.3%',
      icon: '🌱',
      color: 'text-carbon-400'
    }
  ]

  return (
    <Card variant="default">
      <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gray-800/50 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className={clsx('text-sm', stat.color)}>
                {stat.change}
              </span>
            </div>

            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.title}</div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}

export default StatsOverview