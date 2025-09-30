import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePhysics } from '../../hooks/usePhysics'
import { useAccount } from '../../hooks/useHedera'
import { PhysicsType, Rarity } from '../../types/physics'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Loader from '../../components/common/Loader'
import PhysicsNFTCard from './PhysicsNFTCard'

interface FilterState {
  physicsType: PhysicsType | 'ALL'
  rarity: Rarity | 'ALL'
  priceRange: [number, number]
  sortBy: 'price' | 'rarity' | 'created' | 'name'
  sortOrder: 'asc' | 'desc'
}

export const PhysicsMarketplace: React.FC = () => {
  const { state, mintPhysicsNFT, tradeNFT, loadMarketplace } = usePhysics()
  const account = useAccount()
  const [showMintModal, setShowMintModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState<any>(null)
  const [filters, setFilters] = useState<FilterState>({
    physicsType: 'ALL',
    rarity: 'ALL',
    priceRange: [0, 1000],
    sortBy: 'created',
    sortOrder: 'desc'
  })
  const [mintForm, setMintForm] = useState({
    physicsType: PhysicsType.GRAVITY,
    rarity: Rarity.COMMON,
    properties: {
      magnitude: 1.0,
      duration: 60,
      range: 10,
      cooldown: 30,
      energyCost: 10,
      compatibility: []
    }
  })

  useEffect(() => {
    loadMarketplace()
  }, [loadMarketplace])

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
      case Rarity.COMMON: return 'text-gray-400'
      case Rarity.UNCOMMON: return 'text-green-400'
      case Rarity.RARE: return 'text-blue-400'
      case Rarity.EPIC: return 'text-purple-400'
      case Rarity.LEGENDARY: return 'text-orange-400'
      case Rarity.MYTHIC: return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const filteredNFTs = state.nfts
    .filter(nft => {
      if (filters.physicsType !== 'ALL' && nft.physicsType !== filters.physicsType) return false
      if (filters.rarity !== 'ALL' && nft.rarity !== filters.rarity) return false
      const price = parseFloat(nft.price)
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false
      return true
    })
    .sort((a, b) => {
      let aValue: any, bValue: any

      switch (filters.sortBy) {
        case 'price':
          aValue = parseFloat(a.price)
          bValue = parseFloat(b.price)
          break
        case 'rarity':
          const rarityOrder = [Rarity.COMMON, Rarity.UNCOMMON, Rarity.RARE, Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC]
          aValue = rarityOrder.indexOf(a.rarity)
          bValue = rarityOrder.indexOf(b.rarity)
          break
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'created':
          aValue = new Date(a.metadata.createdAt).getTime()
          bValue = new Date(b.metadata.createdAt).getTime()
          break
        default:
          return 0
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const handleMint = async () => {
    const nft = await mintPhysicsNFT(
      mintForm.physicsType,
      mintForm.rarity,
      mintForm.properties
    )

    if (nft) {
      setShowMintModal(false)
      // Reset form
      setMintForm({
        physicsType: PhysicsType.GRAVITY,
        rarity: Rarity.COMMON,
        properties: {
          magnitude: 1.0,
          duration: 60,
          range: 10,
          cooldown: 30,
          energyCost: 10,
          compatibility: []
        }
      })
    }
  }

  if (!account) {
    return (
      <Card variant="physics" className="text-center">
        <div className="py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-physics-500/20 flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Wallet First</h3>
          <p className="text-gray-400">
            Connect your Hedera wallet to access the Physics NFT Marketplace
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Marketplace Header */}
      <Card variant="physics" gradient className="relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  rotate: [0, 180, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-physics-400 to-purple-400 flex items-center justify-center"
              >
                <span className="text-2xl">⚡</span>
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold font-quantum">Physics NFT Marketplace</h2>
                <p className="text-gray-400">
                  Trade real-world physics properties as NFTs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                🔍 Filters
              </Button>

              <Button
                variant="physics"
                onClick={() => setShowMintModal(true)}
                glow
              >
                <span className="text-xl mr-2">⚡</span>
                Mint NFT
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl text-physics-400 mb-1">
                {state.nfts.length}
              </div>
              <p className="text-sm text-gray-400">Total NFTs</p>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl text-purple-400 mb-1">
                {Object.values(PhysicsType).length}
              </div>
              <p className="text-sm text-gray-400">Physics Types</p>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl text-green-400 mb-1">
                {state.nfts.filter(nft => nft.owner === account.accountId).length}
              </div>
              <p className="text-sm text-gray-400">My NFTs</p>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <div className="text-2xl text-yellow-400 mb-1">
                {state.nfts.filter(nft => nft.owner !== account.accountId).length}
              </div>
              <p className="text-sm text-gray-400">Available</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card variant="default">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Filters & Sorting</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Physics Type
                    </label>
                    <select
                      value={filters.physicsType}
                      onChange={(e) => setFilters(prev => ({ ...prev, physicsType: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-physics-400 focus:outline-none"
                    >
                      <option value="ALL">All Types</option>
                      {Object.values(PhysicsType).map((type) => (
                        <option key={type} value={type}>
                          {getPhysicsIcon(type)} {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Rarity
                    </label>
                    <select
                      value={filters.rarity}
                      onChange={(e) => setFilters(prev => ({ ...prev, rarity: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-physics-400 focus:outline-none"
                    >
                      <option value="ALL">All Rarities</option>
                      {Object.values(Rarity).map((rarity) => (
                        <option key={rarity} value={rarity}>
                          {rarity}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-physics-400 focus:outline-none"
                    >
                      <option value="created">Date Created</option>
                      <option value="price">Price</option>
                      <option value="rarity">Rarity</option>
                      <option value="name">Name</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Order
                    </label>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-physics-400 focus:outline-none"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NFT Grid */}
      {filteredNFTs.length === 0 ? (
        <Card variant="default" className="text-center">
          <div className="py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No NFTs Found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your filters or mint the first physics NFT
            </p>
            <Button
              variant="physics"
              onClick={() => setShowMintModal(true)}
            >
              Mint First NFT
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNFTs.map((nft) => (
            <PhysicsNFTCard
              key={nft.tokenId}
              nft={nft}
              onSelect={() => setSelectedNFT(nft)}
              isOwner={nft.owner === account?.accountId}
            />
          ))}
        </div>
      )}

      {/* Mint NFT Modal */}
      <Modal
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        title="Mint Physics NFT"
        variant="physics"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-gray-400">
            Create a new physics NFT that grants control over fundamental forces of nature.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Physics Type
              </label>
              <select
                value={mintForm.physicsType}
                onChange={(e) => setMintForm(prev => ({ ...prev, physicsType: e.target.value as PhysicsType }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-physics-400 focus:outline-none"
              >
                {Object.values(PhysicsType).map((type) => (
                  <option key={type} value={type}>
                    {getPhysicsIcon(type)} {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Rarity
              </label>
              <select
                value={mintForm.rarity}
                onChange={(e) => setMintForm(prev => ({ ...prev, rarity: e.target.value as Rarity }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-physics-400 focus:outline-none"
              >
                {Object.values(Rarity).map((rarity) => (
                  <option key={rarity} value={rarity}>
                    {rarity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Properties</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Magnitude
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="5.0"
                  value={mintForm.properties.magnitude}
                  onChange={(e) => setMintForm(prev => ({
                    ...prev,
                    properties: { ...prev.properties, magnitude: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-physics-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={mintForm.properties.duration}
                  onChange={(e) => setMintForm(prev => ({
                    ...prev,
                    properties: { ...prev.properties, duration: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-physics-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Range (meters)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={mintForm.properties.range}
                  onChange={(e) => setMintForm(prev => ({
                    ...prev,
                    properties: { ...prev.properties, range: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-physics-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Energy Cost
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={mintForm.properties.energyCost}
                  onChange={(e) => setMintForm(prev => ({
                    ...prev,
                    properties: { ...prev.properties, energyCost: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-physics-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-physics-900/20 border border-physics-500/30 rounded-lg">
            <h5 className="font-semibold text-physics-300 mb-2">💰 Minting Cost</h5>
            <p className="text-sm text-physics-200">
              Base cost: 10 HBAR + rarity multiplier. Higher rarity NFTs cost more to mint
              but have stronger effects and higher trading value.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="physics"
              onClick={handleMint}
              loading={state.isMinting}
              className="flex-1"
            >
              Mint Physics NFT
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowMintModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* NFT Details Modal */}
      <Modal
        isOpen={!!selectedNFT}
        onClose={() => setSelectedNFT(null)}
        title="Physics NFT Details"
        variant="physics"
        size="xl"
      >
        {selectedNFT && (
          <div className="space-y-6">
            {/* NFT details would go here */}
            <p>Detailed view of {selectedNFT.name}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PhysicsMarketplace