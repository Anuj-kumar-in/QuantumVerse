import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {type PhysicsNFT, PhysicsType, Rarity } from '../../types/physics'
import { usePhysics } from '../../hooks/usePhysics'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import clsx from 'clsx'

interface PhysicsNFTCardProps {
  nft: PhysicsNFT
  onSelect: () => void
  isOwner: boolean
  compact?: boolean
}

export const PhysicsNFTCard: React.FC<PhysicsNFTCardProps> = ({
  nft,
  onSelect,
  isOwner,
  compact = false
}) => {
  const { tradeNFT } = usePhysics()
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [tradeForm, setTradeForm] = useState({
    toAccountId: '',
    price: nft.price
  })

  const getPhysicsIcon = (type: PhysicsType) => {
    switch (type) {
      case PhysicsType.GRAVITY: return '🌍'
      case PhysicsType.TIME: return '⏰'
      case PhysicsType.WEATHER: return '🌦️'
      case PhysicsType.MATTER: return '⚛️'
      case PhysicsType.ENERGY: return '⚡'
      case PhysicsType.SPACE: return '🌌'
      case PhysicsType.QUANTUM_FIELD: return '🔮'
      default: return '❓'
    }
  }

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.COMMON: return 'border-gray-400 text-gray-400'
      case Rarity.UNCOMMON: return 'border-green-400 text-green-400'
      case Rarity.RARE: return 'border-blue-400 text-blue-400'
      case Rarity.EPIC: return 'border-purple-400 text-purple-400'
      case Rarity.LEGENDARY: return 'border-orange-400 text-orange-400'
      case Rarity.MYTHIC: return 'border-red-400 text-red-400'
      default: return 'border-gray-400 text-gray-400'
    }
  }

  const getRarityGlow = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.COMMON: return 'shadow-gray-400/20'
      case Rarity.UNCOMMON: return 'shadow-green-400/30'
      case Rarity.RARE: return 'shadow-blue-400/40'
      case Rarity.EPIC: return 'shadow-purple-400/50'
      case Rarity.LEGENDARY: return 'shadow-orange-400/60'
      case Rarity.MYTHIC: return 'shadow-red-400/70'
      default: return 'shadow-gray-400/20'
    }
  }

  const handleTrade = async () => {
    if (!tradeForm.toAccountId) return

    const success = await tradeNFT(nft.tokenId, tradeForm.toAccountId, tradeForm.price)
    if (success) {
      setShowTradeModal(false)
      setTradeForm({ toAccountId: '', price: nft.price })
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
        onClick={onSelect}
      >
        <Card
          variant="physics"
          className={clsx(
            'relative overflow-hidden transition-all duration-300',
            getRarityColor(nft.rarity),
            getRarityGlow(nft.rarity),
            compact ? 'p-4' : 'p-6'
          )}
        >
          {/* Rarity Indicator */}
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-current opacity-20" />

          {/* NFT Image/Icon */}
          <div className="relative mb-4">
            <div className={clsx(
              'rounded-lg bg-gradient-to-br from-physics-500/20 to-purple-500/20 flex items-center justify-center mx-auto border-2',
              compact ? 'w-16 h-16' : 'w-24 h-24',
              getRarityColor(nft.rarity)
            )}>
              <span className={compact ? 'text-2xl' : 'text-4xl'}>
                {getPhysicsIcon(nft.physicsType)}
              </span>
            </div>

            {/* Animated Effect Ring */}
            <motion.div
              className={clsx(
                'absolute inset-0 rounded-lg border-2 opacity-0',
                getRarityColor(nft.rarity)
              )}
              animate={{
                scale: [1, 1.2],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          </div>

          {/* NFT Info */}
          <div className="space-y-3">
            <div>
              <h3 className={clsx(
                'font-bold truncate',
                compact ? 'text-sm' : 'text-lg'
              )}>
                {nft.name}
              </h3>
              <p className={clsx(
                'text-gray-400 truncate',
                compact ? 'text-xs' : 'text-sm'
              )}>
                {nft.description}
              </p>
            </div>

            {/* Properties */}
            {!compact && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Magnitude:</span>
                  <span className="text-physics-400">{nft.properties.magnitude}x</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-physics-400">{nft.properties.duration}s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Range:</span>
                  <span className="text-physics-400">{nft.properties.range}m</span>
                </div>
              </div>
            )}

            {/* Rarity Badge */}
            <div className="flex items-center justify-between">
              <span className={clsx(
                'px-2 py-1 rounded-full text-xs font-bold border',
                getRarityColor(nft.rarity)
              )}>
                {nft.rarity}
              </span>

              <div className="text-right">
                <p className={clsx(
                  'font-bold',
                  compact ? 'text-sm' : 'text-lg'
                )}>
                  {nft.price} ℏ
                </p>
                {!compact && (
                  <p className="text-xs text-gray-400">
                    #{nft.tokenId.split('/')[1]}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {isOwner ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowTradeModal(true)
                  }}
                  className="flex-1"
                >
                  Trade
                </Button>
              ) : (
                <Button
                  variant="physics"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowTradeModal(true)
                  }}
                  className="flex-1"
                >
                  Buy
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={onSelect}
              >
                Details
              </Button>
            </div>

            {/* Effects Preview */}
            {nft.effects.length > 0 && !compact && (
              <div className="pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Effects:</p>
                <div className="flex flex-wrap gap-1">
                  {nft.effects.slice(0, 2).map((effect, index) => (
                    <span
                      key={index}
                      className="px-1 py-0.5 text-xs bg-physics-500/20 text-physics-300 rounded"
                    >
                      {effect.name}
                    </span>
                  ))}
                  {nft.effects.length > 2 && (
                    <span className="px-1 py-0.5 text-xs bg-gray-600 text-gray-300 rounded">
                      +{nft.effects.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Trade Modal */}
      <Modal
        isOpen={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        title={isOwner ? "Trade NFT" : "Buy NFT"}
        variant="physics"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-physics-500/20 to-purple-500/20 flex items-center justify-center border-2 border-physics-400">
              <span className="text-2xl">{getPhysicsIcon(nft.physicsType)}</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">{nft.name}</h3>
              <p className="text-gray-400">{nft.physicsType} • {nft.rarity}</p>
            </div>
          </div>

          {isOwner ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Transfer To Account ID
                </label>
                <input
                  type="text"
                  value={tradeForm.toAccountId}
                  onChange={(e) => setTradeForm(prev => ({ ...prev, toAccountId: e.target.value }))}
                  placeholder="0.0.123456"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-physics-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Sale Price (HBAR)
                </label>
                <input
                  type="text"
                  value={tradeForm.price}
                  onChange={(e) => setTradeForm(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-physics-400 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-physics-900/20 border border-physics-500/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Purchase Price:</span>
                  <span className="text-2xl font-bold text-physics-400">{nft.price} ℏ</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Your Account ID
                </label>
                <input
                  type="text"
                  value={tradeForm.toAccountId}
                  onChange={(e) => setTradeForm(prev => ({ ...prev, toAccountId: e.target.value }))}
                  placeholder="Your account will receive the NFT"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-physics-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="physics"
              onClick={handleTrade}
              disabled={!tradeForm.toAccountId}
              className="flex-1"
            >
              {isOwner ? 'Transfer NFT' : `Buy for ${nft.price} ℏ`}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowTradeModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default PhysicsNFTCard