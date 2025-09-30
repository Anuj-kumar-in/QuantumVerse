import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import Card from '../../components/common/Card'

export const ActivityFeed: React.FC = () => {
  const activities = [
    {
      type: 'quantum',
      icon: '⚛️',
      title: 'Quantum Identity Generated',
      description: 'Your quantum-resistant identity has been created',
      time: '2 minutes ago',
      color: 'text-quantum-400'
    },
    {
      type: 'physics',
      icon: '⚡',
      title: 'Physics NFT Minted',
      description: 'Gravity Manipulator NFT successfully minted',
      time: '15 minutes ago',
      color: 'text-physics-400'
    },
    {
      type: 'ai',
      icon: '🤖',
      title: 'AI Entity Created',
      description: 'Zephyr the Quantum Dragon is now active',
      time: '1 hour ago',
      color: 'text-ai-400'
    },
    {
      type: 'carbon',
      icon: '🌱',
      title: 'Carbon Rewards Claimed',
      description: 'Earned 25.5 CARBON tokens for eco-friendly actions',
      time: '3 hours ago',
      color: 'text-carbon-400'
    }
  ]

  return (
    <Card variant="default">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg"
          >
            <div className={clsx('text-2xl', activity.color)}>
              {activity.icon}
            </div>

            <div className="flex-1">
              <div className="font-medium mb-1">{activity.title}</div>
              <div className="text-sm text-gray-400 mb-1">{activity.description}</div>
              <div className="text-xs text-gray-500">{activity.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}

export default ActivityFeed