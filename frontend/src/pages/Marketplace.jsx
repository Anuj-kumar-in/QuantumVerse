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
import { useWallet } from '../hooks/useWallet'
import { Buffer } from 'buffer'

// Configuration from your .env
const PHYSICS_NFT_TOKEN_ID = import.meta.env.VITE_PHYSICS_TOKEN_ID || '0.0.7043803'
const TREASURY_ID = import.meta.env.VITE_TREASURY_ID || '0.0.7043802'
const SUPPLY_PRIVATE_KEY = import.meta.env.VITE_SUPPLY_PRIVATE_KEY || '3030020100300706052b8104000a04220420c7d06017ac53d4092eb48c5434fa832284239639d13b7806c1ad0c6bb1b74a5d'
const SUPPLY_ID = import.meta.env.VITE_SUPPLY_ID || '0.0.7043801'

// Pinata Configuration
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2OTY2MmE1MS0wOWM5LTRlZDQtYjU0My0zNzkzZTNhZWE5ZmIiLCJlbWFpbCI6ImFrMjMwNTQ5M0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZmExNTExYmJlMDg4NWM3NTM0NmMiLCJzY29wZWRLZXlTZWNyZXQiOiIyMjM4ZjEwNzFjMWMzOWY5MDUxNjU5MmQ4OGE1ZmY1NzBmODVlMGFlNmE0YzQyNjNjNmY2OWYzNGE4ODJhMzEzIiwiZXhwIjoxNzkxODI1MjQ3fQ.-8sKxFrG854kWLp7kRdot5NH4FBuF6j_6KTm-26PSVQ'

const AUTHORIZED_MINTERS = [
    '0.0.6896538',
    '0.0.6962607'
]

// Physics NFT Types
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

const RARITY_COLORS = {
  [Rarity.COMMON]: 'text-gray-400',
  [Rarity.UNCOMMON]: 'text-green-400',
  [Rarity.RARE]: 'text-blue-400',
  [Rarity.EPIC]: 'text-purple-400',
  [Rarity.LEGENDARY]: 'text-yellow-400',
  [Rarity.MYTHIC]: 'text-red-400'
}

// IPFS Upload Function
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
            throw new Error(`IPFS upload failed: ${errorData.error || response.statusText}`)
        }

        const result = await response.json()
        console.log('IPFS Upload Success:', result.IpfsHash)
        return result.IpfsHash
    } catch (error) {
        console.error('IPFS upload error:', error)
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
        image: `https://via.placeholder.com/300x300/5c4033/eec329?text=${PHYSICS_TYPE_NAMES[physicsType].slice(0,2)}${id}`,
        price: (Math.random() * 50 + 10).toFixed(2),
        creator: `0.0.${Math.floor(Math.random() * 1000000) + 100000}`,
        createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        metadata: JSON.stringify({ physicsType, rarity, properties }),
        properties,
        isForSale: Math.random() > 0.3
    }
}

const Card = ({ children, className = '', variant = 'default', gradient = false }) => {
    const baseClasses = 'rounded-xl border p-6 transition-all duration-300'
    const variantClasses = {
        default: 'bg-[var(--pane)] border-[color:rgba(238,195,41,0.2)]',
        physics: 'bg-[var(--ink)] border-[color:rgba(238,195,41,0.3)]',
        quantum: 'bg-[var(--ink)] border-[color:rgba(238,195,41,0.3)]',
        ai: 'bg-[var(--ink)] border-[color:rgba(238,195,41,0.3)]',
        carbon: 'bg-[var(--ink)] border-[color:rgba(238,195,41,0.3)]'
    }
    const gradientClass = gradient ? 'bg-gradient-to-br from-[var(--pane)] via-[var(--ink)] to-[var(--pane)]' : ''
    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${gradientClass} ${className}`}>
            {children}
        </div>
    )
}

const Button = ({ children, onClick, variant = 'default', size = 'md', disabled = false, className = '' }) => {
    const baseClasses = 'font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2'
    const sizeClasses = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-base', lg: 'px-6 py-3 text-lg' }
    const variantClasses = {
        default: 'bg-[var(--pane)] text-[var(--mustard)] hover:opacity-80 focus:ring-[var(--mustard)]',
        physics: 'bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80 focus:ring-[var(--mustard)]',
        quantum: 'bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80 focus:ring-[var(--mustard)]',
        ai: 'bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80 focus:ring-[var(--mustard)]',
        carbon: 'bg-[var(--mustard)] text-[var(--ink)] hover:opacity-80 focus:ring-[var(--mustard)]',
        secondary: 'bg-transparent border border-[color:rgba(238,195,41,0.5)] text-[var(--mustard)] hover:bg-[var(--pane)] focus:ring-[var(--mustard)]'
    }
    return (
        <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
            {children}
        </button>
    )
}

const Loader = ({ size = 'md' }) => {
    const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
    return <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-[var(--mustard)] border-t-transparent`}></div>
}

const NFTCard = ({ nft, onBuy, onView, isOwned, isConnected, loading }) => {
     const [randomImageNum] = useState(() => Math.floor(Math.random() * 10) + 1);
    const rarityColor = RARITY_COLORS[nft.rarity] || 'text-gray-400'
    const physicsTypeName = PHYSICS_TYPE_NAMES[nft.physicsType] || 'Unknown'
    const rarityName = RARITY_NAMES[nft.rarity] || 'Unknown'
    const imageUrl = `/image/${randomImageNum}.jpg`;
    
    return (
        <Card variant="physics" className="hover:shadow-xl transition-shadow duration-300">
            <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-[var(--pane)]">
                <img src={imageUrl} alt={nft.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-[var(--mustard)] truncate">{nft.name}</h3>
                    <span className={`text-sm font-medium ${rarityColor}`}>{rarityName}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-white/70">{physicsTypeName}</span>
                    <span className="text-[var(--mustard)]">Energy: {nft.energy}</span>
                </div>
                <p className="text-white/70 text-sm line-clamp-2">{nft.description}</p>
                <div className="space-y-1">
                    <h4 className="text-sm font-medium text-[var(--mustard)]">Physics Properties:</h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="text-white/60">Magnitude: {nft.properties.magnitude}</div>
                        <div className="text-white/60">Duration: {nft.properties.duration}s</div>
                        <div className="text-white/60">Range: {nft.properties.range}m</div>
                        <div className="text-white/60">Cooldown: {nft.properties.cooldown}s</div>
                    </div>
                </div>
                <div className="pt-3 border-t border-[color:rgba(238,195,41,0.2)]">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-lg font-bold text-[var(--mustard)]">{nft.price} HBAR</div>
                            <div className="text-xs text-white/60">Serial #{nft.serialNumber}</div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => onView(nft)}>View</Button>
                            {!isOwned && nft.isForSale && (
                                <Button variant="physics" size="sm" onClick={() => onBuy(nft)} disabled={!isConnected || loading}>
                                    {loading ? <Loader size="sm" /> : 'Buy'}
                                </Button>
                            )}
                            {isOwned && (<Button variant="quantum" size="sm" disabled>Owned</Button>)}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}

const FilterPanel = ({ filters, onFilterChange, nftCount }) => (
    <Card variant="default" className="mb-6">
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--mustard)]">Filters ({nftCount} items)</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Price Range (HBAR)</label>
                    <div className="flex gap-2">
                        <input type="number" placeholder="Min" value={filters.priceMin} onChange={(e) => onFilterChange({ priceMin: e.target.value })} className="w-full px-3 py-1 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)] text-sm" />
                        <input type="number" placeholder="Max" value={filters.priceMax} onChange={(e) => onFilterChange({ priceMax: e.target.value })} className="w-full px-3 py-1 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)] text-sm" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Physics Type</label>
                    <select value={filters.physicsType || ''} onChange={(e) => onFilterChange({ physicsType: e.target.value })} className="w-full px-3 py-1 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)] text-sm">
                        <option value="">All Types</option>
                        {Object.entries(PHYSICS_TYPE_NAMES).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Rarity</label>
                    <select value={filters.rarity || ''} onChange={(e) => onFilterChange({ rarity: e.target.value })} className="w-full px-3 py-1 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)] text-sm">
                        <option value="">All Rarities</option>
                        {Object.entries(RARITY_NAMES).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Availability</label>
                    <select value={filters.availability} onChange={(e) => onFilterChange({ availability: e.target.value })} className="w-full px-3 py-1 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)] text-sm">
                        <option value="">All</option>
                        <option value="forSale">For Sale</option>
                        <option value="owned">Owned</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Sort By</label>
                    <select value={filters.sortBy} onChange={(e) => onFilterChange({ sortBy: e.target.value })} className="w-full px-3 py-1 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)] text-sm">
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
                <input type="text" placeholder="Search NFTs..." value={filters.search} onChange={(e) => onFilterChange({ search: e.target.value })} className="w-full px-4 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)]" />
            </div>
        </div>
    </Card>
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
            <Card variant="physics" gradient className="text-center">
                <h2 className="text-3xl font-bold text-[var(--mustard)] mb-2">QuantumVerse Dashboard</h2>
                <p className="text-white/80">{isConnected ? `Connected: ${connectedAccount}` : 'Connect wallet to see personalized stats'}</p>
            </Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card variant="physics" className="text-center"><div className="text-2xl font-bold text-[var(--mustard)]">{stats.total}</div><div className="text-sm text-white/60">Total NFTs</div></Card>
                <Card variant="quantum" className="text-center"><div className="text-2xl font-bold text-[var(--mustard)]">{stats.forSale}</div><div className="text-sm text-white/60">For Sale</div></Card>
                <Card variant="ai" className="text-center"><div className="text-2xl font-bold text-[var(--mustard)]">{stats.owned}</div><div className="text-sm text-white/60">Owned</div></Card>
                <Card variant="default" className="text-center"><div className="text-2xl font-bold text-[var(--mustard)]">{stats.floor === Infinity ? '-' : stats.floor}</div><div className="text-sm text-white/60">Floor (HBAR)</div></Card>
            </div>
            <div className="flex gap-3">
                <Button variant="physics" onClick={() => onGoTo('shop')}>Go to Shop</Button>
                <Button variant="quantum" onClick={() => onGoTo('mint')}>Mint NFT</Button>
                <Button variant="secondary" onClick={() => onGoTo('owned')}>Owned NFTs</Button>
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

    const costHBAR = 10

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
            image: `https://via.placeholder.com/512x512/5c4033/eec329?text=${PHYSICS_TYPE_NAMES[physicsType]}`,
            type: "image/png",
            format: "HIP412@2.0.0",
            properties: {
                creator: connectedAccount,
                createdAt: Date.now(),
                energy: Math.floor(Math.random() * 100) + 50,
                isActive: true
            },
            attributes: [
                {
                    trait_type: "Physics Type",
                    value: PHYSICS_TYPE_NAMES[physicsType]
                },
                {
                    trait_type: "Rarity",
                    value: RARITY_NAMES[rarity]
                },
                {
                    trait_type: "Magnitude",
                    value: finalProperties.magnitude,
                    display_type: "number"
                },
                {
                    trait_type: "Duration",
                    value: finalProperties.duration,
                    display_type: "number",
                    max_value: 100
                },
                {
                    trait_type: "Range",
                    value: finalProperties.range,
                    display_type: "number",
                    max_value: 200
                },
                {
                    trait_type: "Cooldown",
                    value: finalProperties.cooldown,
                    display_type: "number"
                },
                {
                    trait_type: "Energy Cost",
                    value: finalProperties.energyCost,
                    display_type: "number"
                },
                {
                    trait_type: "Compatibility",
                    value: finalProperties.compatibility.join(', ')
                }
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
        
        console.log('Metadata URI:', metadataURI)
        setMintStatus('IPFS upload complete!')
        
        // Return URI (under 100 bytes)
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
            setCustomProperties({
                magnitude: '',
                duration: '',
                range: '',
                cooldown: '',
                energyCost: ''
            })

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

    if (!isConnected) return <Card variant="default" className="text-center py-10 text-[var(--mustard)]">Connect wallet to mint.</Card>
    if (!authorized) return <Card variant="default" className="text-center py-10 text-[var(--mustard)]">You are not authorized to mint. Authorized: {AUTHORIZED_MINTERS.join(', ')}</Card>

    return (
        <Card variant="default" className="space-y-6">
            <h3 className="text-xl font-bold text-[var(--mustard)]">Mint Physics NFT (10 HBAR)</h3>
            
            {mintStatus && (
                <div className="bg-[var(--mustard)]/10 border border-[var(--mustard)]/30 rounded-lg p-3 text-center">
                    <p className="text-[var(--mustard)] text-sm font-medium">{mintStatus}</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Name *</label>
                    <input 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="NFT Name" 
                        className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)]" 
                        disabled={isMinting}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Physics Type</label>
                    <select 
                        value={physicsType} 
                        onChange={e => setPhysicsType(parseInt(e.target.value))} 
                        className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)]"
                        disabled={isMinting}
                    >
                        {Object.entries(PHYSICS_TYPE_NAMES).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Rarity</label>
                    <select 
                        value={rarity} 
                        onChange={e => setRarity(parseInt(e.target.value))} 
                        className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)]"
                        disabled={isMinting}
                    >
                        {Object.entries(RARITY_NAMES).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Description *</label>
                <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Description" 
                    rows={3} 
                    className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)]" 
                    disabled={isMinting}
                />
            </div>

            <div>
                <h4 className="text-lg font-medium text-[var(--mustard)] mb-3">Custom Physics Properties (Optional)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-white/70 mb-1">Magnitude</label>
                        <input 
                            type="number" 
                            value={customProperties.magnitude} 
                            onChange={e => setCustomProperties(prev => ({...prev, magnitude: e.target.value}))} 
                            placeholder="Auto-generated" 
                            className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)] text-sm" 
                            disabled={isMinting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/70 mb-1">Duration (s)</label>
                        <input 
                            type="number" 
                            value={customProperties.duration} 
                            onChange={e => setCustomProperties(prev => ({...prev, duration: e.target.value}))} 
                            placeholder="Auto-generated" 
                            className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)] text-sm" 
                            disabled={isMinting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/70 mb-1">Range (m)</label>
                        <input 
                            type="number" 
                            value={customProperties.range} 
                            onChange={e => setCustomProperties(prev => ({...prev, range: e.target.value}))} 
                            placeholder="Auto-generated" 
                            className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)] text-sm" 
                            disabled={isMinting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/70 mb-1">Cooldown (s)</label>
                        <input 
                            type="number" 
                            value={customProperties.cooldown} 
                            onChange={e => setCustomProperties(prev => ({...prev, cooldown: e.target.value}))} 
                            placeholder="Auto-generated" 
                            className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)] text-sm" 
                            disabled={isMinting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/70 mb-1">Energy Cost</label>
                        <input 
                            type="number" 
                            value={customProperties.energyCost} 
                            onChange={e => setCustomProperties(prev => ({...prev, energyCost: e.target.value}))} 
                            placeholder="Auto-generated" 
                            className="w-full px-3 py-2 bg-[var(--ink)] border border-[color:rgba(238,195,41,0.3)] rounded text-[var(--mustard)] text-sm" 
                            disabled={isMinting}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[color:rgba(238,195,41,0.2)]">
                <div className="text-white/80">Cost: <span className="text-[var(--mustard)] font-bold">{costHBAR} HBAR</span></div>
                <Button variant="physics" onClick={handleMint} disabled={isMinting || !name || !description}>
                    {isMinting ? (
                        <div className="flex items-center gap-2">
                            <Loader size="sm" />
                            <span>Minting...</span>
                        </div>
                    ) : 'Mint NFT'}
                </Button>
            </div>
        </Card>
    )
}

const OwnedNFTs = ({ nfts, connectedAccount }) => {
    const owned = nfts.filter(n => n.owner === connectedAccount)
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[var(--mustard)]">Owned Physics NFTs</h3>
            {owned.length === 0 ? (
                <Card variant="default" className="text-white/70 text-center py-12">
                    <p className="text-lg mb-4">No owned NFTs yet.</p>
                    <p className="text-sm text-white/50">Mint or buy your first Physics NFT to get started!</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {owned.map(n => <NFTCard key={n.id} nft={n} onBuy={() => {}} onView={() => {}} isOwned={true} isConnected={true} loading={false} />)}
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
        if (filters.search) filtered = filtered.filter(n => n.name.toLowerCase().includes(filters.search.toLowerCase()) || n.description.toLowerCase().includes(filters.search.toLowerCase()))
        
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
        if (!isConnected) { await connectWallet(); return }
        setTxLoading(true)
        try {
            await sendHbar(nft.owner, parseFloat(nft.price))
            setUserNFTs(prev => [...prev, nft.id])
            setNfts(prev => prev.map(n => n.id === nft.id ? { ...n, isForSale: false, owner: connectedAccount } : n))
            alert(`Purchased ${nft.name} for ${nft.price} HBAR`)
        } catch (e) {
            console.error(e); alert(`Purchase failed: ${e.message}`)
        } finally { setTxLoading(false) }
    }

    const viewNFT = (nft) => { setSelectedNFT(nft); setShowModal(true) }

    const onMinted = ({ serial, name, physicsType, rarity, properties }) => {
        const fresh = generatePhysicsNFT(nfts.length + 1)
        fresh.name = name || fresh.name
        fresh.physicsType = physicsType
        fresh.rarity = rarity
        fresh.properties = { ...fresh.properties, ...properties }
        fresh.owner = connectedAccount
        fresh.isForSale = false
        fresh.serialNumber = serial
        setNfts(prev => [fresh, ...prev])
        setUserNFTs(prev => [...prev, fresh.id])
    }

    const stats = {
        totalNFTs: nfts.length,
        forSale: nfts.filter(n => n.isForSale).length,
        owned: userNFTs.length,
        totalValue: nfts.reduce((s, n) => s + parseFloat(n.price), 0).toFixed(1),
        floorPrice: nfts.filter(n => n.isForSale).reduce((m, n) => Math.min(m, parseFloat(n.price)), Infinity).toFixed(1)
    }

    const displayedNFTs = filteredNFTs()

    if (isLoading) return (
        <div className="min-h-screen bg-[var(--ink)] text-white p-8 flex items-center justify-center">
            <div className="text-center"><Loader size="lg" /><p className="mt-4 text-white/60">Loading QuantumVerse Marketplace...</p></div>
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-[var(--ink)] text-white p-8 flex items-center justify-center">
            <Card variant="quantum" className="text-center p-8">
                <div className="text-red-400 text-lg mb-4">⚠️ Error</div>
                <p className="text-white/80 mb-4">{error}</p>
                <Button variant="physics" onClick={() => window.location.reload()}>Retry</Button>
            </Card>
        </div>
    )

    return (
        <>
            <style>{`
                        :root {
            --ink: #0a0a0f;           /* Very dark blue-black */
            --pane: #1a1a2e;         /* Dark blue-gray */
            --mustard: #ffd700;      /* Gold accent */
        }


                @keyframes fade {
                    from { opacity:.3; transform: translateY(4px); }
                    to   { opacity:1;  transform: translateY(0); }
                }
                .fade-in { animation: fade .25s ease; }
            `}</style>

            <div className="min-h-screen bg-[var(--ink)] text-white">
                <div className="bg-gradient-to-r from-[var(--pane)] via-[var(--ink)] to-[var(--pane)] p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-5xl font-bold mb-4 text-[var(--mustard)]">Physics<span className="text-yellow-300"> NFT's</span></h1>
                            <p className="text-xl text-white/80 max-w-3xl mx-auto">Trade physics properties and quantum assets on Hedera Hashgraph</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-[3vw] mb-6">
                            <Button variant={section==='dashboard'?'physics':'secondary'} onClick={()=>setSection('dashboard')}>Dashboard</Button>
                            <Button variant={section==='shop'?'physics':'secondary'} onClick={()=>setSection('shop')}>Shop</Button>
                            <Button variant={section==='owned'?'physics':'secondary'} onClick={()=>setSection('owned')}>Owned</Button>
                            <Button variant={section==='mint'?'quantum':'secondary'} onClick={()=>setSection('mint')}>Mint NFT</Button>
                        </div>
                        <div className="flex justify-center mb-2">
                            {isConnected ? (
                                <div className="bg-[var(--mustard)]/20 border border-[color:rgba(238,195,41,0.3)] rounded-lg px-4 py-2">
                                    <span className="text-[var(--mustard)]">Connected: {connectedAccount?.slice(0,8)}...{connectedAccount?.slice(-4)}</span>
                                </div>
                            ) : (
                                <Button variant="physics" size="lg" onClick={connectWallet}>Connect Wallet</Button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <Card variant="physics" className="text-center"><div className="text-2xl font-bold text-[var(--mustard)]">{stats.totalNFTs}</div><div className="text-sm text-white/60">Total NFTs</div></Card>
                            <Card variant="quantum" className="text-center"><div className="text-2xl font-bold text-[var(--mustard)]">{stats.forSale}</div><div className="text-sm text-white/60">For Sale</div></Card>
                            <Card variant="ai" className="text-center"><div className="text-2xl font-bold text-[var(--mustard)]">{stats.owned}</div><div className="text-sm text-white/60">Owned</div></Card>
                            <Card variant="carbon" className="text-center"><div className="text-2xl font-bold text-[var(--mustard)]">{stats.totalValue}</div><div className="text-sm text-white/60">Total Value (HBAR)</div></Card>
                            <Card variant="carbon" className="text-center"><div className="text-2xl font-bold text-[var(--mustard)]">{stats.floorPrice}</div><div className="text-sm text-white/60">Floor Price (HBAR)</div></Card>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto p-8">
                    {section === 'dashboard' && (
                        <Dashboard isConnected={isConnected} connectedAccount={connectedAccount} nfts={nfts} userNFTs={userNFTs} onGoTo={setSection} />
                    )}

                    {section === 'mint' && (
                        <MintNFT isConnected={isConnected} connectedAccount={connectedAccount} onMinted={onMinted} />
                    )}

                    {section === 'owned' && (
                        <OwnedNFTs nfts={nfts} connectedAccount={connectedAccount} />
                    )}

                    {section === 'shop' && (
                        <>
                            <FilterPanel filters={filters} onFilterChange={handleFilterChange} nftCount={displayedNFTs.length} />
                            {displayedNFTs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {displayedNFTs.map((nft) => (
                                        <NFTCard key={nft.id} nft={nft} onBuy={buyNFT} onView={viewNFT} isOwned={userNFTs.includes(nft.id)} isConnected={isConnected} loading={txLoading} />
                                    ))}
                                </div>
                            ) : (
                                <Card variant="default" className="text-center py-12">
                                    <div className="text-white/60 text-lg">No NFTs found matching your criteria</div>
                                    <Button variant="secondary" className="mt-4" onClick={() => setFilters({ priceMin: '', priceMax: '', rarity: '', physicsType: '', availability: '', sortBy: 'newest', search: '' })}>Clear Filters</Button>
                                </Card>
                            )}
                        </>
                    )}
                </div>

                {showModal && selectedNFT && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                        <Card variant="physics" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-[var(--mustard)]">{selectedNFT.name}</h2>
                                <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>✕</Button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div><img src={selectedNFT.image} alt={selectedNFT.name} className="w-full rounded-lg" /></div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-[var(--mustard)] mb-2">Details</h3>
                                        <div className="space-y-2 text-sm">
                                            <div><span className="text-white/60">Token ID:</span> <span className="text-white/80">{selectedNFT.id}</span></div>
                                            <div><span className="text-white/60">Serial:</span> <span className="text-white/80">#{selectedNFT.serialNumber}</span></div>
                                            <div><span className="text-white/60">Physics Type:</span> <span className="text-white/80">{PHYSICS_TYPE_NAMES[selectedNFT.physicsType]}</span></div>
                                            <div><span className="text-white/60">Rarity:</span> <span className={RARITY_COLORS[selectedNFT.rarity]}>{RARITY_NAMES[selectedNFT.rarity]}</span></div>
                                            <div><span className="text-white/60">Energy:</span> <span className="text-[var(--mustard)]">{selectedNFT.energy}</span></div>
                                            <div><span className="text-white/60">Owner:</span> <span className="text-white/80">{selectedNFT.owner}</span></div>
                                            <div><span className="text-white/60">Price:</span> <span className="text-[var(--mustard)]">{selectedNFT.price} HBAR</span></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-[var(--mustard)] mb-2">Physics Properties</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-white/60">Magnitude:</span><span className="text-white/80">{selectedNFT.properties.magnitude}</span></div>
                                            <div className="flex justify-between"><span className="text-white/60">Duration:</span><span className="text-white/80">{selectedNFT.properties.duration}s</span></div>
                                            <div className="flex justify-between"><span className="text-white/60">Range:</span><span className="text-white/80">{selectedNFT.properties.range}m</span></div>
                                            <div className="flex justify-between"><span className="text-white/60">Cooldown:</span><span className="text-white/80">{selectedNFT.properties.cooldown}s</span></div>
                                            <div className="flex justify-between"><span className="text-white/60">Energy Cost:</span><span className="text-white/80">{selectedNFT.properties.energyCost}</span></div>
                                            <div className="mt-2">
                                                <span className="text-white/60">Compatible with:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedNFT.properties.compatibility.map((comp, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-[var(--mustard)]/20 rounded text-xs text-[var(--mustard)]">{comp}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        {userNFTs.includes(selectedNFT.id) ? (
                                            <Button variant="quantum" className="w-full" disabled>Owned</Button>
                                        ) : selectedNFT.isForSale ? (
                                            <Button variant="physics" className="w-full" onClick={() => { setShowModal(false); buyNFT(selectedNFT) }} disabled={!isConnected || txLoading}>{txLoading ? <Loader size="sm" /> : `Buy for ${selectedNFT.price} HBAR`}</Button>
                                        ) : (
                                            <Button variant="secondary" className="w-full" disabled>Not For Sale</Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </>
    )
}

export default Marketplace
