import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { type AIEntity, EntityType } from '../../hooks/useAI'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'

interface AIEntityCardProps {
  entity: AIEntity
  onSelect: () => void
  compact?: boolean
}

export const AIEntityCard: React.FC<AIEntityCardProps> = ({
  entity,
  onSelect,
  compact = false
}) => {
  const getEntityTypeIcon = (type: number) => {
    switch (type) {
      case 0: return '🤖' // COMPANION
      case 1: return '🛡️' // GUARDIAN
      case 2: return '💼' // TRADER
      case 3: return '🗺️' // EXPLORER
      case 4: return '🎨' // CREATOR
      case 5: return '🔬' // SCIENTIST/RESEARCHER
      default: return '❓'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'EXECUTING': return 'text-green-400'
      case 'WAITING': return 'text-yellow-400'
      case 'COMPLETED': return 'text-blue-400'
      case 'FAILED': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getEntityTypeName = (type: number) => {
    const names = ['COMPANION', 'GUARDIAN', 'TRADER', 'EXPLORER', 'CREATOR', 'SCIENTIST']
    return names[type] || 'UNKNOWN'
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onSelect}
    >
      <Card variant="ai" className="relative overflow-hidden">
        {/* Entity Avatar */}
        <div className="relative mb-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-ai-500/20 to-yellow-500/20 flex items-center justify-center border-2 border-ai-400">
            <span className="text-2xl">{getEntityTypeIcon(entity.type)}</span>
          </div>

          {/* Status Indicator */}
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-800 flex items-center justify-center">
            <div className={clsx(
              'w-2 h-2 rounded-full',
              entity.behavior.currentAction?.status === 'EXECUTING' ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
            )} />
          </div>
        </div>

        {/* Entity Info */}
        <div className="space-y-3">
          <div className="text-center">
            <h3 className="font-bold text-lg truncate">{entity.name}</h3>
            <p className="text-sm text-gray-400">{getEntityTypeName(entity.type)}</p>
          </div>

          {/* Current Action */}
          {entity.behavior.currentAction && (
            <div className="p-2 bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-400">Current Action:</p>
              <p className={clsx('text-sm font-medium', getStatusColor(entity.behavior.currentAction.status))}>
                {entity.behavior.currentAction.type.replace('-', ' ')}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="text-lg font-bold text-ai-400">
                {entity.evolution.level}
              </div>
              <div className="text-gray-400">Level</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">
                {parseFloat(entity.earnings.totalEarned).toFixed(0)}
              </div>
              <div className="text-gray-400">Earned</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Experience</span>
              <span>{entity.evolution.experience}/{entity.evolution.nextLevelRequirement}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-ai-400 to-yellow-400 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${(entity.evolution.experience / entity.evolution.nextLevelRequirement) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant="ai"
            size="sm"
            onClick={onSelect}
            className="w-full"
          >
            View Details
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

export default AIEntityCard
