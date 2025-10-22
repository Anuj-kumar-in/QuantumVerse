import React, { useState, useEffect, useCallback } from 'react'
import { 
    TokenMintTransaction,
    TransferTransaction,
    TokenId,
    AccountId,
    Hbar,
    Client,
    PrivateKey
} from '@hashgraph/sdk'
import { useWallet } from '../Context/WalletContext'
import { Buffer } from 'buffer'

const PHYSICS_NFT_TOKEN_ID = import.meta.env.VITE_PHYSICS_TOKEN_ID || '0.0.7043803'
const TREASURY_ID = import.meta.env.VITE_TREASURY_ID || '0.0.7043802'
const SUPPLY_PRIVATE_KEY = import.meta.env.VITE_SUPPLY_PRIVATE_KEY || '3030020100300706052b8104000a04220420c7d06017ac53d4092eb48c5434fa832284239639d13b7806c1ad0c6bb1b74a5d'
const SUPPLY_ID = import.meta.env.VITE_SUPPLY_ID || '0.0.7043801'
const PINATA_JWT = import.meta.env.VITE_APP_PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2OTY2MmE1MS0wOWM5LTRlZDQtYjU0My0zNzkzZTNhZWE5ZmIiLCJlbWFpbCI6ImFrMjMwNTQ5M0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZmExNTExYmJlMDg4NWM3NTM0NmMiLCJzY29wZWRLZXlTZWNyZXQiOiIyMjM4ZjEwNzFjMWMzOWY5MDUxNjU5MmQ4OGE1ZmY1NzBmODVlMGFlNmE0YzQyNjNjNmY2OWYzNGE4ODJhMzEzIiwiZXhwIjoxNzkxODI1MjQ3fQ.-8sKxFrG854kWLp7kRdot5NH4FBuF6j_6KTm-26PSVQ'

const AUTHORIZED_MINTERS = [
    '0.0.6896538',
    '0.0.6962607'
]

export const PhysicsType = {
  GRAVITY: 0,
  TIME: 1,
  WEATHER: 2,
  MATTER: 3,
  ENERGY: 4,
  SPACE: 5,
  QUANTUM_FIELD: 6
}

export const Rarity = {
  COMMON: 0,
  UNCOMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
  MYTHIC: 5
}

const PHYSICS_TYPE_NAMES = {
  [PhysicsType.GRAVITY]: 'Gravity',
  [PhysicsType.TIME]: 'Time',
  [PhysicsType.WEATHER]: 'Weather',
  [PhysicsType.MATTER]: 'Matter',
  [PhysicsType.ENERGY]: 'Energy',
  [PhysicsType.SPACE]: 'Space',
  [PhysicsType.QUANTUM_FIELD]: 'Quantum Field'
}

const RARITY_NAMES = {
   [Rarity.COMMON]: 'Common',
   [Rarity.UNCOMMON]: 'Uncommon',
   [Rarity.RARE]: 'Rare',
   [Rarity.EPIC]: 'Epic',
   [Rarity.LEGENDARY]: 'Legendary',
   [Rarity.MYTHIC]: 'Mythic'
}

const RARITY_MULTIPLIERS = {
   [Rarity.COMMON]: 1,
   [Rarity.UNCOMMON]: 1.5,
   [Rarity.RARE]: 2,
   [Rarity.EPIC]: 2.5,
   [Rarity.LEGENDARY]: 3,
   [Rarity.MYTHIC]: 3
}

const PHYSICS_TYPE_ADDITIONS = {
   [PhysicsType.GRAVITY]: 5,
   [PhysicsType.TIME]: 10,
   [PhysicsType.WEATHER]: 15,
   [PhysicsType.MATTER]: 20,
   [PhysicsType.ENERGY]: 25,
   [PhysicsType.SPACE]: 30,
   [PhysicsType.QUANTUM_FIELD]: 35
}

const RARITY_COLORS = {
  [Rarity.COMMON]: 'text-gray-400',
  [Rarity.UNCOMMON]: 'text-green-400',
  [Rarity.RARE]: 'text-blue-400',
  [Rarity.EPIC]: 'text-purple-400',
  [Rarity.LEGENDARY]: 'text-yellow-400',
  [Rarity.MYTHIC]: 'text-red-400'
}

const uploadToIPFS = async (nftData) => {
    try {
        const blob = new Blob([JSON.stringify(nftData, null, 2)], { type: 'application/json' })
        const formData = new FormData()
        formData.append('file', blob, 'metadata.json')

        const pinataMetadata = JSON.stringify({
            name: `${nftData.name} - Metadata`,
        })
        formData.append('pinataMetadata', pinataMetadata)

        const pinataOptions = JSON.stringify({
            cidVersion: 0,
        })
        formData.append('pinataOptions', pinataOptions)

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`
            },
            body: formData
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`IPFS upload failed: ${JSON.stringify(errorData) || response.statusText}`)
        }

        const result = await response.json()
        return result.IpfsHash
    } catch (error) {
        throw new Error(`Failed to upload to IPFS: ${error.message}`)
    }
}

const generateDefaultProperties = (physicsType, rarity) => {
    const baseMultiplier = rarity + 1
    const typeMultipliers = {
        [PhysicsType.GRAVITY]: { magnitude: 1.2, duration: 0.8, range: 1.0, cooldown: 0.9, energyCost: 1.1 },
        [PhysicsType.TIME]: { magnitude: 0.9, duration: 1.5, range: 0.7, cooldown: 1.3, energyCost: 1.4 },
        [PhysicsType.WEATHER]: { magnitude: 1.1, duration: 1.0, range: 1.3, cooldown: 0.8, energyCost: 1.0 },
        [PhysicsType.MATTER]: { magnitude: 1.3, duration: 0.9, range: 0.8, cooldown: 1.0, energyCost: 1.2 },
        [PhysicsType.ENERGY]: { magnitude: 1.4, duration: 0.7, range: 0.9, cooldown: 1.1, energyCost: 0.8 },
        [PhysicsType.SPACE]: { magnitude: 1.0, duration: 1.2, range: 1.5, cooldown: 1.2, energyCost: 1.3 },
        [PhysicsType.QUANTUM_FIELD]: { magnitude: 1.5, duration: 1.1, range: 1.1, cooldown: 1.4, energyCost: 1.5 }
    }
    
    const multipliers = typeMultipliers[physicsType] || typeMultipliers[PhysicsType.GRAVITY]
    
    return {
        magnitude: Math.round((10 + Math.random() * 90) * baseMultiplier * multipliers.magnitude),
        duration: Math.round((5 + Math.random() * 45) * baseMultiplier * multipliers.duration),
        range: Math.round((8 + Math.random() * 72) * baseMultiplier * multipliers.range),
        cooldown: Math.round((3 + Math.random() * 27) * baseMultiplier * multipliers.cooldown),
        energyCost: Math.round((15 + Math.random() * 85) * baseMultiplier * multipliers.energyCost),
        compatibility: getCompatibility(physicsType)
    }
}

const getCompatibility = (physicsType) => {
    const compatibilityMap = {
        [PhysicsType.GRAVITY]: ['Matter', 'Space'],
        [PhysicsType.TIME]: ['Space', 'Quantum Field'],
        [PhysicsType.WEATHER]: ['Energy', 'Matter'],
        [PhysicsType.MATTER]: ['Gravity', 'Energy'],
        [PhysicsType.ENERGY]: ['Matter', 'Weather'],
        [PhysicsType.SPACE]: ['Gravity', 'Time'],
        [PhysicsType.QUANTUM_FIELD]: ['Time', 'Energy']
    }
    return compatibilityMap[physicsType] || []
}

const generatePhysicsNFT = (id) => {
    const physicsType = Math.floor(Math.random() * 7)
    const rarity = Math.floor(Math.random() * 6)
    const properties = generateDefaultProperties(physicsType, rarity)

    return {
        id: `0.0.${1000000 + id}`,
        serialNumber: id,
        owner: `0.0.${Math.floor(Math.random() * 1000000) + 100000}`,
        physicsType,
        rarity,
        energy: Math.floor(Math.random() * 100) + 50,
        isActive: Math.random() > 0.5,
        name: `${PHYSICS_TYPE_NAMES[physicsType]} Force #${id}`,
        description: `A ${RARITY_NAMES[rarity]} ${PHYSICS_TYPE_NAMES[physicsType]} NFT with quantum properties`,
        image: `/image/${Math.floor(Math.random() * 10) + 1}.jpg`,
        price: (Math.random() * 50 + 10).toFixed(2),
        creator: `0.0.${Math.floor(Math.random() * 1000000) + 100000}`,
        createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        metadata: JSON.stringify({ physicsType, rarity, properties }),
        properties,
        isForSale: Math.random() > 0.3
    }
}

const Loader = ({ size = 'md' }) => {
    const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
    return <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-[var(--mustard)] border-t-transparent`}></div>
}

const NFTCard = ({ nft, onBuy, onView, isOwned, isConnected, loading }) => {
    const rarityColor = RARITY_COLORS[nft.rarity] || 'text-gray-400'
    const physicsTypeName = PHYSICS_TYPE_NAMES[nft.physicsType] || 'Unknown'
    const rarityName = RARITY_NAMES[nft.rarity] || 'Unknown'
    
    return (
        <div className="group bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-[var(--mustard)]/50 transition-all duration-300 hover:shadow-xl">
            <div className="aspect-square mb-4 overflow-hidden rounded-xl bg-[var(--pane)]">
                <img 
                    src={nft.image} 
                    alt={nft.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                />
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-white group-hover:text-[var(--mustard)] transition-colors truncate">
                        {nft.name}
                    </h3>
                    <span className={`text-sm font-medium ${rarityColor} ml-2`}>{rarityName}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{physicsTypeName}</span>
                    <span className="text-[var(--mustard)]">Energy: {nft.energy}</span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{nft.description}</p>
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-[var(--mustard)]">Physics Properties:</h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="text-gray-500">Magnitude: {nft.properties.magnitude}</div>
                        <div className="text-gray-500">Duration: {nft.properties.duration}s</div>
                        <div className="text-gray-500">Range: {nft.properties.range}m</div>
                        <div className="text-gray-500">Cooldown: {nft.properties.cooldown}s</div>
                    </div>
                </div>
                <div className="pt-3 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-lg font-bold text-[var(--mustard)]">{nft.price} HBAR</div>
                            <div className="text-xs text-gray-500">Serial #{nft.serialNumber}</div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onView(nft)}
                                className="px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 bg-transparent border border-[color:rgba(238,195,41,0.5)] text-[var(--mustard)] hover:bg-[var(--pane)]"
                            >
                                View
                            </button>
                            {!isOwned && nft.isForSale && (
                                <button 
                                    onClick={() => onBuy(nft)} 
                                    disabled={!isConnected || loading}
                                    className="px-3 py-1.5 text-sm rounded-lg font-semibold transition-all duration-200 shadow-lg bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader size="sm" /> : 'Buy'}
                                </button>
                            )}
                            {isOwned && (
                                <button 
                                    disabled
                                    className="px-3 py-1.5 text-sm rounded-lg font-medium bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed"
                                >
                                    Owned
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const FilterPanel = ({ filters, onFilterChange, nftCount }) => (
    <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--mustard)] flex items-center gap-2">
                <span className="text-xl">🔍</span>
                Filters ({nftCount} items)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price Range (HBAR)</label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            placeholder="Min" 
                            value={filters.priceMin} 
                            onChange={(e) => onFilterChange({ priceMin: e.target.value })} 
                            className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded-lg text-[var(--mustard)] text-sm focus:border-[var(--mustard)] focus:outline-none" 
                        />
                        <input 
                            type="number" 
                            placeholder="Max" 
                            value={filters.priceMax} 
                            onChange={(e) => onFilterChange({ priceMax: e.target.value })} 
                            className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded-lg text-[var(--mustard)] text-sm focus:border-[var(--mustard)] focus:outline-none" 
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Physics Type</label>
                    <select 
                        value={filters.physicsType || ''} 
                        onChange={(e) => onFilterChange({ physicsType: e.target.value })} 
                        className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded-lg text-[var(--mustard)] text-sm focus:border-[var(--mustard)] focus:outline-none"
                    >
                        <option value="">All Types</option>
                        {Object.entries(PHYSICS_TYPE_NAMES).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rarity</label>
                    <select 
                        value={filters.rarity || ''} 
                        onChange={(e) => onFilterChange({ rarity: e.target.value })} 
                        className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded-lg text-[var(--mustard)] text-sm focus:border-[var(--mustard)] focus:outline-none"
                    >
                        <option value="">All Rarities</option>
                        {Object.entries(RARITY_NAMES).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Availability</label>
                    <select 
                        value={filters.availability} 
                        onChange={(e) => onFilterChange({ availability: e.target.value })} 
                        className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded-lg text-[var(--mustard)] text-sm focus:border-[var(--mustard)] focus:outline-none"
                    >
                        <option value="">All</option>
                        <option value="forSale">For Sale</option>
                        <option value="owned">Owned</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                    <select 
                        value={filters.sortBy} 
                        onChange={(e) => onFilterChange({ sortBy: e.target.value })} 
                        className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded-lg text-[var(--mustard)] text-sm focus:border-[var(--mustard)] focus:outline-none"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="priceHigh">Price: High to Low</option>
                        <option value="priceLow">Price: Low to High</option>
                        <option value="rarity">Rarity</option>
                        <option value="energy">Energy</option>
                    </select>
                </div>
            </div>
            <div>
                <input 
                    type="text" 
                    placeholder="Search NFTs..." 
                    value={filters.search} 
                    onChange={(e) => onFilterChange({ search: e.target.value })} 
                    className="w-full px-4 py-3 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded-xl text-[var(--mustard)] focus:border-[var(--mustard)] focus:outline-none" 
                />
            </div>
        </div>
    </div>
)

const Dashboard = ({ isConnected, connectedAccount, nfts, userNFTs, onGoTo }) => {
    const stats = {
        total: nfts.length,
        forSale: nfts.filter(n => n.isForSale).length,
        owned: userNFTs.length,
        floor: nfts.filter(n => n.isForSale).reduce((m, n) => Math.min(m, parseFloat(n.price)), Infinity)
    }
    
    return (
        <div className="space-y-6">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-[var(--pane)] via-[var(--ink)] to-[var(--pane)] rounded-3xl p-8 shadow-2xl border border-gray-800 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--mustard)] opacity-5 rounded-full blur-3xl"></div>
                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--mustard)] to-yellow-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg mx-auto mb-4">
                        🛒
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--mustard)] to-yellow-600 bg-clip-text text-transparent mb-2">
                        Physics NFT Marketplace
                    </h2>
                    <p className="text-gray-400">
                        {isConnected ? `Connected: ${connectedAccount}` : 'Connect wallet to view personalized stats'}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total NFTs', value: stats.total, icon: '📊', color: 'from-blue-500 to-cyan-600' },
                    { label: 'For Sale', value: stats.forSale, icon: '🏷️', color: 'from-green-500 to-emerald-600' },
                    { label: 'Owned', value: stats.owned, icon: '💎', color: 'from-purple-500 to-pink-600' },
                    { label: 'Floor (HBAR)', value: stats.floor === Infinity ? '-' : stats.floor, icon: '💰', color: 'from-yellow-500 to-orange-600' }
                ].map((stat, index) => (
                    <div key={index} className="bg-gradient-to-br from-[var(--ink)] to-gray-900 p-5 rounded-2xl border border-gray-800 hover:border-[var(--mustard)]/50 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
                            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                <span className="text-xl">{stat.icon}</span>
                            </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <button 
                    onClick={() => onGoTo('shop')}
                    className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90"
                >
                    🛒 Browse Shop
                </button>
                <button 
                    onClick={() => onGoTo('mint')}
                    className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:opacity-90"
                >
                    ⚡ Mint NFT
                </button>
                <button 
                    onClick={() => onGoTo('owned')}
                    className="px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-transparent border border-[color:rgba(238,195,41,0.5)] text-[var(--mustard)] hover:bg-[var(--pane)]"
                >
                    💼 Owned NFTs
                </button>
            </div>
        </div>
    )
}

const MintNFT = ({ connectedAccount, isConnected, onMinted }) => {
    const authorized = isConnected && AUTHORIZED_MINTERS.includes(connectedAccount)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [physicsType, setPhysicsType] = useState(PhysicsType.GRAVITY)
    const [rarity, setRarity] = useState(Rarity.COMMON)
    const [customProperties, setCustomProperties] = useState({
        magnitude: '',
        duration: '',
        range: '',
        cooldown: '',
        energyCost: ''
    })
    const [isMinting, setIsMinting] = useState(false)
    const [mintStatus, setMintStatus] = useState('')

    const calculateCost = (rarity, physicsType) => {
        const baseCost = 10
        const rarityMultiplier = RARITY_MULTIPLIERS[rarity] || 1
        const physicsAddition = PHYSICS_TYPE_ADDITIONS[physicsType] || 0
        return baseCost * rarityMultiplier + physicsAddition
    }

    const costHBAR = calculateCost(rarity, physicsType)

    const createMetadata = async (physicsType, rarity, customProperties) => {
        setMintStatus('Generating properties...')
        
        const defaultProperties = generateDefaultProperties(physicsType, rarity)
        const finalProperties = {
            magnitude: customProperties.magnitude ? parseInt(customProperties.magnitude) : defaultProperties.magnitude,
            duration: customProperties.duration ? parseInt(customProperties.duration) : defaultProperties.duration,
            range: customProperties.range ? parseInt(customProperties.range) : defaultProperties.range,
            cooldown: customProperties.cooldown ? parseInt(customProperties.cooldown) : defaultProperties.cooldown,
            energyCost: customProperties.energyCost ? parseInt(customProperties.energyCost) : defaultProperties.energyCost,
            compatibility: defaultProperties.compatibility
        }
        
        // HIP-412 compliant metadata structure
        const nftData = {
            name,
            description,
            image: `/image/${Math.floor(Math.random() * 10) + 1}.jpg`,
            type: "image/png",
            format: "HIP412@2.0.0",
            properties: {
                creator: connectedAccount,
                createdAt: Date.now(),
                energy: Math.floor(Math.random() * 100) + 50,
                isActive: true
            },
            attributes: [
                { trait_type: "Physics Type", value: PHYSICS_TYPE_NAMES[physicsType] },
                { trait_type: "Rarity", value: RARITY_NAMES[rarity] },
                { trait_type: "Magnitude", value: finalProperties.magnitude, display_type: "number" },
                { trait_type: "Duration", value: finalProperties.duration, display_type: "number", max_value: 100 },
                { trait_type: "Range", value: finalProperties.range, display_type: "number", max_value: 200 },
                { trait_type: "Cooldown", value: finalProperties.cooldown, display_type: "number" },
                { trait_type: "Energy Cost", value: finalProperties.energyCost, display_type: "number" },
                { trait_type: "Compatibility", value: finalProperties.compatibility.join(', ') }
            ],
            localization: {
                uri: "",
                default: "en",
                locales: ["en"]
            }
        }
        
        setMintStatus('Uploading to IPFS...')
        // Upload to IPFS
        const ipfsCID = await uploadToIPFS(nftData)
        const metadataURI = `ipfs://${ipfsCID}`

        setMintStatus('IPFS upload complete!')
        
        // Return URI under 100 bytes
        return Buffer.from(metadataURI)
    }

    const handleMint = async () => {
        if (!authorized) return alert('Not authorized to mint')
        if (!name || !description) return alert('Name and description required')
        
        setIsMinting(true)
        setMintStatus('Starting mint process...')
        
        try {
            // Step 1: Process payment from user
            setMintStatus('Processing payment...')
            const receiptPay = await sendHbarOnChain(connectedAccount, TREASURY_ID, costHBAR)
            if (receiptPay.status && receiptPay.status._code !== 22) {
                throw new Error('Payment failed')
            }
            setMintStatus('Payment confirmed!')

            // Step 2: Create metadata and upload to IPFS
            const metadata = await createMetadata(physicsType, rarity, customProperties)

            // Step 3: Mint NFT using supply key
            setMintStatus('Minting NFT on Hedera...')
            const client = Client.forTestnet()
            const supplyKey = PrivateKey.fromStringDer(SUPPLY_PRIVATE_KEY)
            client.setOperator(SUPPLY_ID, supplyKey)

            const mintTx = await new TokenMintTransaction()
                .setTokenId(TokenId.fromString(PHYSICS_NFT_TOKEN_ID))
                .setMetadata([metadata])
                .execute(client)
            
            const mintRcpt = await mintTx.getReceipt(client)
            const serialNumber = mintRcpt.serials[0].toString()
            setMintStatus(`NFT Minted! Serial: ${serialNumber}`)

            // Step 4: Transfer NFT to buyer
            setMintStatus('Transferring NFT to your wallet...')
            await new TransferTransaction()
                .addNftTransfer(
                    TokenId.fromString(PHYSICS_NFT_TOKEN_ID),
                    serialNumber,
                    AccountId.fromString(TREASURY_ID),
                    AccountId.fromString(connectedAccount)
                )
                .execute(client)

            setMintStatus('Transfer complete!')

            // CRITICAL: Call onMinted to add NFT to the list
            onMinted && onMinted({ 
                serial: serialNumber, 
                name,
                physicsType,
                rarity,
                properties: customProperties
            })
            
            alert(`✅ Mint Success! Serial: ${serialNumber}\nCheck your wallet for the NFT!`)
            
            // Reset form
            setName('')
            setDescription('')
            setPhysicsType(PhysicsType.GRAVITY)
            setRarity(Rarity.COMMON)
            setCustomProperties({ magnitude: '', duration: '', range: '', cooldown: '', energyCost: '' })
        } catch (e) {
            console.error('Mint Error:', e)
            setMintStatus('Mint failed!')
            alert('Mint failed: ' + (e.message || e))
        } finally {
            setIsMinting(false)
            setTimeout(() => setMintStatus(''), 3000)
        }
    }

    const { sendHbar: sendHbarHook } = useWallet()
    const sendHbarOnChain = async (fromId, toId, amount) => {
        return await sendHbarHook(toId, amount)
    }

    if (!isConnected) {
        return (
            <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-12 border border-gray-800 text-center">
                <div className="text-6xl mb-4 opacity-30">🔐</div>
                <p className="text-gray-400 text-lg">Connect wallet to mint NFTs</p>
            </div>
        )
    }
    
    if (!authorized) {
        return (
            <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-12 border border-gray-800 text-center">
                <div className="text-6xl mb-4 opacity-30">⛔</div>
                <p className="text-gray-400 text-lg mb-2">You are not authorized to mint</p>
                <p className="text-gray-500 text-sm">Authorized: {AUTHORIZED_MINTERS.join(', ')}</p>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-6 border border-gray-800 space-y-6">
            <h3 className="text-xl font-bold text-[var(--mustard)] flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Mint Physics NFT (Base Fee 10 Hbar)
            </h3>
            
            {mintStatus && (
                <div className="bg-[var(--mustard)]/10 border border-[var(--mustard)]/30 rounded-xl p-3 text-center">
                    <p className="text-[var(--mustard)] text-sm font-medium">{mintStatus}</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                    <input 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="NFT Name" 
                        className="w-full px-4 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded-lg text-[var(--mustard)] focus:border-[var(--mustard)] focus:outline-none" 
                        disabled={isMinting}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Physics Type</label>
                    <select
                        value={physicsType}
                        onChange={e => setPhysicsType(parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded-lg text-[var(--mustard)] focus:border-[var(--mustard)] focus:outline-none"
                        disabled={isMinting}
                    >
                        {Object.entries(PHYSICS_TYPE_NAMES).map(([key, name]) => {
                            const addition = PHYSICS_TYPE_ADDITIONS[key] || 0
                            return (
                                <option key={key} value={key}>
                                    {name}{addition > 0 ? ` (+${addition})` : ''}
                                </option>
                            )
                        })}
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rarity</label>
                    <select
                        value={rarity}
                        onChange={e => setRarity(parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded-lg text-[var(--mustard)] focus:border-[var(--mustard)] focus:outline-none"
                        disabled={isMinting}
                    >
                        {Object.entries(RARITY_NAMES).map(([key, name]) => (
                            <option key={key} value={key}>{name} (x{RARITY_MULTIPLIERS[key]})</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Description" 
                    rows={3} 
                    className="w-full px-4 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded-lg text-[var(--mustard)] focus:border-[var(--mustard)] focus:outline-none" 
                    disabled={isMinting}
                />
            </div>

            <div>
                <h4 className="text-lg font-medium text-[var(--mustard)] mb-3">Custom Physics Properties (Optional)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['magnitude', 'duration', 'range', 'cooldown', 'energyCost'].map((prop) => (
                        <div key={prop}>
                            <label className="block text-sm text-gray-400 mb-1 capitalize">{prop.replace('energyCost', 'Energy Cost')}</label>
                            <input 
                                type="number" 
                                value={customProperties[prop]} 
                                onChange={e => setCustomProperties(prev => ({...prev, [prop]: e.target.value}))} 
                                placeholder="Auto-generated" 
                                className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded-lg text-[var(--mustard)] text-sm focus:border-[var(--mustard)] focus:outline-none" 
                                disabled={isMinting}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="text-gray-400">
                    Cost: <span className="text-[var(--mustard)] font-bold text-lg">{costHBAR.toFixed(2)} HBAR</span>
                </div>
                <button 
                    onClick={handleMint} 
                    disabled={isMinting || !name || !description}
                    className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isMinting ? (
                        <div className="flex items-center gap-2">
                            <Loader size="sm" />
                            <span>Minting...</span>
                        </div>
                    ) : '⚡ Mint NFT'}
                </button>
            </div>
        </div>
    )
}

const OwnedNFTs = ({ nfts, connectedAccount }) => {
    const owned = nfts.filter(n => n.owner === connectedAccount)
    
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[var(--mustard)] flex items-center gap-2">
                <span className="text-3xl">💼</span>
                Owned Physics NFTs
            </h3>
            {owned.length === 0 ? (
                <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-12 border border-gray-800 text-center">
                    <div className="text-6xl mb-4 opacity-20">💎</div>
                    <p className="text-gray-400 text-lg mb-2">No owned NFTs yet</p>
                    <p className="text-gray-500 text-sm">Mint or buy your first Physics NFT to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {owned.map(n => (
                        <NFTCard 
                            key={n.id} 
                            nft={n} 
                            onBuy={() => {}} 
                            onView={() => {}} 
                            isOwned={true} 
                            isConnected={true} 
                            loading={false} 
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export const Marketplace = () => {
    const { isConnected, connectedAccount, getSigner, connectWallet, sendHbar } = useWallet()

    const [section, setSection] = useState('shop')
    const [isLoading, setIsLoading] = useState(true)
    const [nfts, setNfts] = useState([])
    const [userNFTs, setUserNFTs] = useState([])
    const [error, setError] = useState(null)
    const [txLoading, setTxLoading] = useState(false)
    const [selectedNFT, setSelectedNFT] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const [filters, setFilters] = useState({ 
        priceMin: '', 
        priceMax: '', 
        rarity: '', 
        physicsType: '',
        availability: '', 
        sortBy: 'newest', 
        search: '' 
    })

    useEffect(() => {
        const load = async () => {
            setIsLoading(true)
            try {
                await new Promise(r => setTimeout(r, 800))
                const mock = Array.from({ length: 24 }, (_, i) => generatePhysicsNFT(i + 1))
                setNfts(mock)
                if (isConnected && connectedAccount) {
                    const owned = mock.filter(() => Math.random() > 0.8).slice(0, 3)
                    setUserNFTs(owned.map(n => n.id))
                }
            } catch (e) {
                console.error(e)
                setError('Failed to load marketplace. Please try again.')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [isConnected, connectedAccount])

    const filteredNFTs = useCallback(() => {
        let filtered = [...nfts]
        if (filters.priceMin) filtered = filtered.filter(n => parseFloat(n.price) >= parseFloat(filters.priceMin))
        if (filters.priceMax) filtered = filtered.filter(n => parseFloat(n.price) <= parseFloat(filters.priceMax))
        if (filters.rarity) filtered = filtered.filter(n => n.rarity.toString() === filters.rarity)
        if (filters.physicsType) filtered = filtered.filter(n => n.physicsType.toString() === filters.physicsType)
        if (filters.availability === 'forSale') filtered = filtered.filter(n => n.isForSale && !userNFTs.includes(n.id))
        if (filters.availability === 'owned') filtered = filtered.filter(n => userNFTs.includes(n.id))
        if (filters.search) filtered = filtered.filter(n => 
            n.name.toLowerCase().includes(filters.search.toLowerCase()) || 
            n.description.toLowerCase().includes(filters.search.toLowerCase())
        )
        
        switch (filters.sortBy) {
            case 'priceHigh': filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)); break
            case 'priceLow': filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)); break
            case 'oldest': filtered.sort((a, b) => a.createdAt - b.createdAt); break
            case 'rarity': filtered.sort((a, b) => b.rarity - a.rarity); break
            case 'energy': filtered.sort((a, b) => b.energy - a.energy); break
            default: filtered.sort((a, b) => b.createdAt - a.createdAt)
        }
        return filtered
    }, [nfts, filters, userNFTs])

    const handleFilterChange = (nf) => setFilters(prev => ({ ...prev, ...nf }))

    const buyNFT = async (nft) => {
        if (!isConnected) {
            await connectWallet()
            return
        }
        setTxLoading(true)
        try {
            await sendHbar(nft.owner, parseFloat(nft.price))
            setUserNFTs(prev => [...prev, nft.id])
            setNfts(prev => prev.map(n => n.id === nft.id ? {...n, isForSale: false, owner: connectedAccount} : n))
            alert(`Purchased ${nft.name} for ${nft.price} HBAR`)
        } catch (e) {
            console.error(e)
            alert('Purchase failed: ' + e.message)
        } finally {
            setTxLoading(false)
        }
    }

    const viewNFT = (nft) => {
        setSelectedNFT(nft)
        setShowModal(true)
    }

    const onMinted = ({ serial, name, physicsType, rarity, properties }) => {
        const fresh = generatePhysicsNFT(nfts.length + 1)
        fresh.name = name || fresh.name
        fresh.physicsType = physicsType
        fresh.rarity = rarity
        fresh.properties = {...fresh.properties, ...properties}
        fresh.owner = connectedAccount
        fresh.isForSale = false
        fresh.serialNumber = serial
        
        setNfts(prev => [fresh, ...prev])
        setUserNFTs(prev => [...prev, fresh.id])
    }

    return (
        <>
              <style>{`
        :root {
          --ink: #0a0a0f;
          --pane: #1a1a2e;
          --mustard: #ffd700;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--mustard);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4a942;
        }
      `}</style>

            <div className="min-h-screen bg-gradient-to-br from-[var(--ink)] via-gray-900 to-[var(--ink)] text-white">
                <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">

                    {/* Hero Section */}
                    <section className="relative bg-gradient-to-br from-[var(--pane)] via-[var(--ink)] to-[var(--pane)] rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-800 overflow-hidden fade-in">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--mustard)] opacity-5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 opacity-5 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[var(--mustard)] to-yellow-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                                    ⚛️
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--mustard)] to-yellow-600 bg-clip-text text-transparent">
                                        Physics NFT Marketplace
                                    </h1>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Powered by Hedera Blockchain & Quantum Properties
                                    </p>
                                </div>
                            </div>

                            <p className="text-gray-300 text-lg mb-6 max-w-3xl">
                                Trade physics properties and quantum assets. Discover unique NFTs with real quantum mechanics and physics attributes.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-green-400 text-sm font-medium">
                                        {isConnected ? `Connected: ${connectedAccount.slice(0, 8)}...${connectedAccount.slice(-4)}` : 'Wallet Disconnected'}
                                    </span>
                                </div>

                                <button
                                    onClick={() => isConnected ? null : connectWallet()}
                                    disabled={isConnected}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                                        isConnected
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90'
                                    }`}
                                >
                                    {isConnected ? 'Wallet Connected' : '🔷 Connect Hedera Wallet'}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Navigation Tabs */}
                    <nav className="bg-gradient-to-r from-[var(--pane)] to-[var(--ink)] rounded-2xl p-2 shadow-2xl border border-gray-800 fade-in">
                        <ul className="flex flex-wrap justify-center gap-2">
                            {[
                                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                                { id: 'shop', label: 'Shop', icon: '🛒' },
                                { id: 'mint', label: 'Mint', icon: '⚡' },
                                { id: 'owned', label: 'Owned', icon: '💼' }
                            ].map((tab) => (
                                <li key={tab.id}>
                                    <button 
                                        onClick={() => setSection(tab.id)}
                                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                                            section === tab.id 
                                                ? 'bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] shadow-lg' 
                                                : 'text-gray-400 hover:text-[var(--mustard)] hover:bg-[var(--ink)]/50'
                                        }`}
                                    >
                                        <span className="mr-1">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Main Content */}
                    {isLoading ? (
                        <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-12 shadow-2xl border border-gray-800 text-center fade-in">
                            <Loader size="lg" />
                            <p className="text-gray-400 mt-4">Loading marketplace...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-12 border border-red-500/30 text-center fade-in">
                            <div className="text-6xl mb-4 opacity-30">❌</div>
                            <p className="text-red-400 text-lg">{error}</p>
                        </div>
                    ) : (
                        <div className="fade-in">
                            {section === 'dashboard' && (
                                <Dashboard 
                                    isConnected={isConnected}
                                    connectedAccount={connectedAccount}
                                    nfts={nfts}
                                    userNFTs={userNFTs}
                                    onGoTo={setSection}
                                />
                            )}

                            {section === 'shop' && (
                                <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800 space-y-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-blue-500/10 rounded-xl">
                                            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-white">NFT Shop</h2>
                                    </div>
                                    
                                    <FilterPanel 
                                        filters={filters} 
                                        onFilterChange={handleFilterChange} 
                                        nftCount={filteredNFTs().length} 
                                    />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredNFTs().map(nft => (
                                            <NFTCard 
                                                key={nft.id} 
                                                nft={nft} 
                                                onBuy={buyNFT} 
                                                onView={viewNFT} 
                                                isOwned={userNFTs.includes(nft.id)} 
                                                isConnected={isConnected} 
                                                loading={txLoading} 
                                            />
                                        ))}
                                    </div>

                                    {filteredNFTs().length === 0 && (
                                        <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 rounded-2xl p-12 border border-gray-800 text-center">
                                            <div className="text-6xl mb-4 opacity-20">🔍</div>
                                            <p className="text-gray-400 text-lg">No NFTs found matching your filters</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {section === 'mint' && (
                                <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-purple-500/10 rounded-xl">
                                            <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-white">Mint NFT</h2>
                                    </div>
                                    <MintNFT 
                                        connectedAccount={connectedAccount}
                                        isConnected={isConnected}
                                        onMinted={onMinted}
                                    />
                                </div>
                            )}

                            {section === 'owned' && (
                                <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800">
                                    <OwnedNFTs 
                                        nfts={nfts}
                                        connectedAccount={connectedAccount}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Modal */}
                    {showModal && selectedNFT && (
                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 fade-in">
                            <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800 shadow-2xl custom-scrollbar">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-2xl font-bold text-[var(--mustard)]">{selectedNFT.name}</h2>
                                    <button 
                                        onClick={() => setShowModal(false)}
                                        className="px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 bg-transparent border border-[color:rgba(238,195,41,0.5)] text-[var(--mustard)] hover:bg-[var(--pane)]"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <img 
                                            src={selectedNFT.image} 
                                            alt={selectedNFT.name} 
                                            className="w-full rounded-xl border border-gray-700" 
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-[var(--mustard)] mb-3">Details</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between p-2 bg-[var(--ink)]/50 rounded-lg">
                                                    <span className="text-gray-400">Token ID:</span> 
                                                    <span className="text-white">{selectedNFT.id}</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-[var(--ink)]/50 rounded-lg">
                                                    <span className="text-gray-400">Serial:</span> 
                                                    <span className="text-white">#{selectedNFT.serialNumber}</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-[var(--ink)]/50 rounded-lg">
                                                    <span className="text-gray-400">Physics Type:</span> 
                                                    <span className="text-white">{PHYSICS_TYPE_NAMES[selectedNFT.physicsType]}</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-[var(--ink)]/50 rounded-lg">
                                                    <span className="text-gray-400">Rarity:</span> 
                                                    <span className={RARITY_COLORS[selectedNFT.rarity]}>{RARITY_NAMES[selectedNFT.rarity]}</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-[var(--ink)]/50 rounded-lg">
                                                    <span className="text-gray-400">Energy:</span> 
                                                    <span className="text-[var(--mustard)]">{selectedNFT.energy}</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-[var(--ink)]/50 rounded-lg">
                                                    <span className="text-gray-400">Owner:</span> 
                                                    <span className="text-white text-xs">{selectedNFT.owner}</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-[var(--ink)]/50 rounded-lg">
                                                    <span className="text-gray-400">Price:</span> 
                                                    <span className="text-[var(--mustard)] font-bold">{selectedNFT.price} HBAR</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-[var(--mustard)] mb-3">Physics Properties</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between p-2 bg-[var(--ink)]/50 rounded-lg">
                                                    <span className="text-gray-400">Magnitude:</span>
                                                    <span className="text-white">{selectedNFT.properties.magnitude}</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-[var(--ink)]/50 rounded-lg">
                                                    <span className="text-gray-400">Duration:</span>
                                                    <span className="text-white">{selectedNFT.properties.duration}s</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-[var(--ink)]/50 rounded-lg">
                                                    <span className="text-gray-400">Range:</span>
                                                    <span className="text-white">{selectedNFT.properties.range}m</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-[var(--ink)]/50 rounded-lg">
                                                    <span className="text-gray-400">Cooldown:</span>
                                                    <span className="text-white">{selectedNFT.properties.cooldown}s</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-[var(--ink)]/50 rounded-lg">
                                                    <span className="text-gray-400">Energy Cost:</span>
                                                    <span className="text-white">{selectedNFT.properties.energyCost}</span>
                                                </div>
                                                <div className="p-2 bg-[var(--ink)]/50 rounded-lg">
                                                    <span className="text-gray-400 block mb-2">Compatible with:</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {selectedNFT.properties.compatibility.map((comp, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-[var(--mustard)]/20 rounded text-xs text-[var(--mustard)]">
                                                                {comp}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            {userNFTs.includes(selectedNFT.id) ? (
                                                <button 
                                                    disabled
                                                    className="w-full px-6 py-3 rounded-xl font-medium bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed"
                                                >
                                                    ✓ Owned
                                                </button>
                                            ) : selectedNFT.isForSale ? (
                                                <button 
                                                    onClick={() => { setShowModal(false); buyNFT(selectedNFT) }} 
                                                    disabled={!isConnected || txLoading}
                                                    className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {txLoading ? <Loader size="sm" /> : `🛒 Buy for ${selectedNFT.price} HBAR`}
                                                </button>
                                            ) : (
                                                <button 
                                                    disabled
                                                    className="w-full px-6 py-3 rounded-xl font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed"
                                                >
                                                    Not For Sale
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    )
}

export default Marketplace
